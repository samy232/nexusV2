"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";

export default function HighchartsChart({ price, history, onIntervalChange }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const { data: session } = useSession();
  const priceLinesRef = useRef({});
  const [libLoaded, setLibLoaded] = useState(false);
  const [activeInterval, setActiveInterval] = useState('1m');
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    if (window.LightweightCharts) {
      setLibLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!libLoaded || !chartContainerRef.current || !window.LightweightCharts) return;

    const { createChart } = window.LightweightCharts;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255,255,255,0.1)',
        shiftVisibleRangeOnNewBar: true, // Follow latest price only if we are at the end
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.1)',
        autoScale: true, // Start with auto-scale
        mode: 0, // Normal price scale
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#758696', width: 1, style: 1 },
        horzLine: { color: '#758696', width: 1, style: 1 },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true, // Allow dragging
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        axisPressedMouseMove: true, // Allow axis dragging
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#22ab94',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#22ab94',
      wickDownColor: '#f23645',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [libLoaded]);

  // Load History ONLY ONCE or when interval changes
  useEffect(() => {
    if (seriesRef.current && history && history.length > 0) {
      const formatted = history.map(d => ({
        time: Math.floor(d[0] / 1000),
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4]
      }));
      seriesRef.current.setData(formatted);
      historyLoadedRef.current = true;
    }
  }, [libLoaded, activeInterval, history.length > 0 ? history[0][0] : null]); // Only reload if first timestamp changes

  // STREAM live price updates (This prevents the "Refresh" jump)
  useEffect(() => {
    if (seriesRef.current && price && history && history.length > 0) {
      const last = history[history.length - 1];
      seriesRef.current.update({
        time: Math.floor(last[0] / 1000),
        open: last[1],
        high: last[2],
        low: last[3],
        close: last[4]
      });
    }
  }, [price]);

  // Update position lines
  useEffect(() => {
    const fetchAndDrawPositions = async () => {
      if (!session || !seriesRef.current) return;
      
      try {
        const res = await fetch('/api/trades?status=OPEN');
        const positions = await res.json();

        Object.values(priceLinesRef.current).forEach(line => {
          if (seriesRef.current) seriesRef.current.removePriceLine(line);
        });
        priceLinesRef.current = {};

        positions.forEach(pos => {
          const pnl = pos.type === 'BUY' 
            ? (price - pos.price) * pos.amount 
            : (pos.price - price) * pos.amount;
          const pnlPercent = (pnl / (pos.price * pos.amount)) * 100;
          const color = pos.type === 'BUY' ? '#22ab94' : '#f23645';

          if (seriesRef.current) {
            const line = seriesRef.current.createPriceLine({
              price: pos.price,
              color: color,
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: true,
              title: `${pos.type} ${pos.amount} | ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`,
            });
            priceLinesRef.current[pos.id] = line;
          }
        });
      } catch (err) {}
    };

    fetchAndDrawPositions();
    const interval = setInterval(fetchAndDrawPositions, 5000);
    return () => clearInterval(interval);
  }, [session, price]);

  const handleIntervalChangeClick = (val) => {
    setActiveInterval(val);
    historyLoadedRef.current = false; // Allow history reload for new interval
    if (onIntervalChange) onIntervalChange(val.toLowerCase());
  };

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem', zIndex: 20 }}>
        {['1m', '5m', '15m', '1h', '1D'].map(int => (
          <button
            key={int}
            onClick={() => handleIntervalChangeClick(int)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: activeInterval === int ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeInterval === int ? 'black' : 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {int}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} style={{ width: '100%', flex: 1 }} />
    </div>
  );
}
