"use client";
import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { useSession } from "next-auth/react";

export default function TradingViewChart({ price, history }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const { data: session } = useSession();
  const priceLinesRef = useRef({});

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Create Chart
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

    const series = chart.addAreaSeries({
      lineColor: '#2962FF',
      topColor: '#2962FF',
      bottomColor: 'rgba(41, 98, 255, 0.28)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // 2. Load History
    if (history && history.length > 0) {
      series.setData(history);
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update with live price
  useEffect(() => {
    if (seriesRef.current && price) {
      seriesRef.current.update({
        time: Math.floor(Date.now() / 1000),
        value: price,
      });
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
          seriesRef.current.removePriceLine(line);
        });
        priceLinesRef.current = {};

        // Draw new lines
        positions.forEach(pos => {
          const line = seriesRef.current.createPriceLine({
            price: pos.price,
            color: '#22ab94',
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `BUY ${pos.amount} @ ${pos.price}`,
          });
          priceLinesRef.current[pos.id] = line;
        });
      } catch (err) {
        console.error("Error drawing lines", err);
      }
    };

    fetchAndDrawPositions();
    const interval = setInterval(fetchAndDrawPositions, 10000); // Sync lines every 10s
    return () => clearInterval(interval);
  }, [session, price]); // Re-sync when session or price changes (price change might mean new trade)

  return (
    <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
}
