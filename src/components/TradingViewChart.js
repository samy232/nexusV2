"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";

export default function TradingViewChart({ price, history }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const { data: session } = useSession();
  const priceLinesRef = useRef({});
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    // 1. Load the library from CDN (Pinned stable version 4.1.1)
    if (window.LightweightCharts) {
      setLibLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
    script.async = true;
    script.onload = () => {
      setLibLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!libLoaded || !chartContainerRef.current || !window.LightweightCharts) return;

    try {
      const { createChart } = window.LightweightCharts;

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
        },
      });

      // Verify the method exists on this version
      if (typeof chart.addAreaSeries !== 'function') {
        console.error("Critical: addAreaSeries is missing even in standalone build", Object.keys(chart));
        return;
      }

      const series = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)',
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = series;

      if (history && history.length > 0) {
        series.setData(history);
      }

      const handleResize = () => {
        if (chart && chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    } catch (err) {
      console.error("Chart build failed", err);
    }
  }, [libLoaded, history]);

  // Update with live price
  useEffect(() => {
    if (seriesRef.current && price) {
      try {
        seriesRef.current.update({
          time: Math.floor(Date.now() / 1000),
          value: price,
        });
      } catch (e) {}
    }
  }, [price]);

  // Draw Position Lines
  useEffect(() => {
    const fetchAndDrawPositions = async () => {
      if (!session || !seriesRef.current) return;
      
      try {
        const res = await fetch('/api/trades?status=OPEN');
        const positions = await res.json();

        // Clear old lines
        Object.values(priceLinesRef.current).forEach(line => {
          if (seriesRef.current) seriesRef.current.removePriceLine(line);
        });
        priceLinesRef.current = {};

        // Draw new lines
        positions.forEach(pos => {
          if (seriesRef.current) {
            const line = seriesRef.current.createPriceLine({
              price: pos.price,
              color: '#22ab94',
              lineWidth: 2,
              lineStyle: 2,
              axisLabelVisible: true,
              title: `BUY ${pos.amount} @ ${pos.price}`,
            });
            priceLinesRef.current[pos.id] = line;
          }
        });
      } catch (err) {
        console.error("Error drawing lines", err);
      }
    };

    fetchAndDrawPositions();
    const interval = setInterval(fetchAndDrawPositions, 10000);
    return () => clearInterval(interval);
  }, [session, price]);

  return (
    <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      {!libLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Syncing with market engine...
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
}
