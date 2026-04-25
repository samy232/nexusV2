"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";

export default function HighchartsChart({ price, history, onIntervalChange }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const labelsContainerRef = useRef();
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [activeInterval, setActiveInterval] = useState('1m');

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
  }, []);

  useEffect(() => {
    if (!libLoaded || !chartContainerRef.current || !window.LightweightCharts || chartRef.current) return;

    const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.03)' }, horzLines: { color: 'rgba(255, 255, 255, 0.03)' } },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: { timeVisible: true, secondsVisible: true, borderColor: 'rgba(255,255,255,0.1)' },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)', autoScale: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { mouseWheel: true, axisPressedMouseMove: true },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#22ab94', downColor: '#f23645', borderVisible: false,
      wickUpColor: '#22ab94', wickDownColor: '#f23645',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // IRON-GRIP SYNC: RequestAnimationFrame loop for perfect "glued" behavior
    let requestRef;
    const syncLoop = () => {
      if (seriesRef.current && labelsContainerRef.current) {
        const labelEls = labelsContainerRef.current.querySelectorAll('[data-trade-id]');
        labelEls.forEach(el => {
          const p = parseFloat(el.getAttribute('data-price'));
          const y = seriesRef.current.priceToCoordinate(p);
          if (y !== null) {
            el.style.transform = `translateY(${y}px)`;
            el.style.visibility = 'visible';
          } else {
            el.style.visibility = 'hidden';
          }
        });
      }
      requestRef = requestAnimationFrame(syncLoop);
    };
    requestRef = requestAnimationFrame(syncLoop);

    const handleResize = () => {
      if (chartRef.current) chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef);
      chart.remove();
      chartRef.current = null;
    };
  }, [libLoaded]);

  // Load History & Stream Updates
  useEffect(() => {
    if (seriesRef.current && history && history.length > 0) {
      const formatted = history.map(d => ({
        time: Math.floor(d[0] / 1000), open: d[1], high: d[2], low: d[3], close: d[4]
      }));
      seriesRef.current.setData(formatted);
    }
  }, [libLoaded, activeInterval, history.length > 0 ? history[0][0] : null]);

  useEffect(() => {
    if (seriesRef.current && price && history && history.length > 0) {
      const last = history[history.length - 1];
      seriesRef.current.update({
        time: Math.floor(last[0] / 1000), open: last[1], high: last[2], low: last[3], close: last[4]
      });
    }
  }, [price]);

  // Fetch Positions
  useEffect(() => {
    const fetchPositions = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/trades?status=OPEN');
        const data = await res.json();
        setPositions(data);
      } catch (e) {}
    };
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCloseTrade = async (tradeId) => {
    try {
      await fetch('/api/trades/close', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, exitPrice: price })
      });
      setPositions(prev => prev.filter(p => p.id !== tradeId));
    } catch (e) {}
  };

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem', zIndex: 20 }}>
        {['1m', '5m', '15m', '1h', '1D'].map(int => (
          <button key={int} onClick={() => { setActiveInterval(int); if (onIntervalChange) onIntervalChange(int.toLowerCase()); }}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: activeInterval === int ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: activeInterval === int ? 'black' : 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
          > {int} </button>
        ))}
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '600px' }} />
        
        <div ref={labelsContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {positions.map(pos => {
            const pnl = pos.type === 'BUY' ? (price - pos.price) * pos.amount : (pos.price - price) * pos.amount;
            const pnlPercent = (pnl / (pos.price * pos.amount)) * 100;
            const themeColor = pos.type === 'BUY' ? '#22ab94' : '#f23645';
            const pnlColor = pnl >= 0 ? '#22ab94' : '#f23645';

            return (
              <div key={pos.id} data-trade-id={pos.id} data-price={pos.price}
                style={{ position: 'absolute', left: '0', top: '0', width: '100%', marginTop: '-12px', display: 'flex', alignItems: 'center', zIndex: 30, pointerEvents: 'none', willChange: 'transform' }}
              >
                <div style={{ width: '100%', height: '1px', borderTop: `1px dashed ${themeColor}`, opacity: 0.3 }} />
                <div style={{ position: 'absolute', left: '10px', background: 'rgba(15, 15, 15, 0.95)', backdropFilter: 'blur(8px)', border: `1.5px solid ${themeColor}`, padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', pointerEvents: 'auto' }}>
                  <span style={{ color: themeColor, fontWeight: '900' }}>{pos.type} {parseFloat(pos.amount.toFixed(8))}</span>
                  <span style={{ color: pnlColor, fontWeight: '900' }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)</span>
                  <button onClick={() => handleCloseTrade(pos.id)} style={{ background: '#f23645', border: 'none', color: 'white', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
