"use client";
import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useSession } from "next-auth/react";

// Enable mouse wheel zoom
if (typeof Highcharts === 'object') {
  require('highcharts/modules/mouse-wheel-zoom')(Highcharts);
}

export default function HighchartsChart({ price, history, onIntervalChange }) {
  const chartComponentRef = useRef(null);
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);
  const [activeInterval, setActiveInterval] = useState('1m');

  const intervals = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '1D', value: '1d' },
  ];

  const fetchPositions = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/trades?status=OPEN');
      const data = await res.json();
      setPositions(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 10000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCloseTrade = async (tradeId) => {
    try {
      const res = await fetch('/api/trades/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, exitPrice: price })
      });
      if (res.ok) fetchPositions();
    } catch (e) {
      console.error("Failed to close trade", e);
    }
  };

  const options = {
    chart: {
      backgroundColor: 'transparent',
      height: 600,
      style: { fontFamily: 'Inter, sans-serif' },
      panning: { enabled: true, type: 'x' },
      zoomType: 'x',
      marginLeft: 10,
      marginRight: 60 // Space for price labels on the right
    },
    title: { text: null },
    credits: { enabled: false },
    rangeSelector: { enabled: false },
    navigator: { enabled: false }, // Removed clutter
    scrollbar: { enabled: false }, // Removed clutter
    xAxis: {
      gridLineColor: 'rgba(255,255,255,0.03)',
      lineColor: 'rgba(255,255,255,0.1)',
      labels: { style: { color: '#666' } },
      crosshair: {
        color: 'rgba(255,255,255,0.2)',
        dashStyle: 'Dash'
      }
    },
    yAxis: {
      gridLineColor: 'rgba(255,255,255,0.03)',
      labels: { align: 'right', x: -5, style: { color: '#666' } },
      opposite: true,
      crosshair: {
        color: 'rgba(255,255,255,0.2)',
        dashStyle: 'Dash'
      },
      plotLines: positions.map(pos => ({
        value: pos.price,
        color: pos.type === 'BUY' ? '#22ab94' : '#f23645',
        dashStyle: 'Dash',
        width: 1,
        zIndex: 5
      }))
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 15, 0.9)',
      style: { color: '#fff' },
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: 8,
      shared: true
    },
    plotOptions: {
      candlestick: {
        color: '#f23645',
        upColor: '#22ab94',
        lineColor: '#f23645',
        upLineColor: '#22ab94'
      }
    },
    series: [{
      name: 'BTC/USDT',
      data: history || [],
      type: 'candlestick',
      id: 'main-series',
      dataGrouping: { enabled: false }
    }]
  };

  const getYPos = (p) => {
    if (!chartComponentRef.current) return -100;
    const chart = chartComponentRef.current.chart;
    if (!chart || !chart.yAxis[0]) return -100;
    return chart.yAxis[0].toPixels(p) - chart.plotTop;
  };

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      {/* Chart Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem', zIndex: 20 }}>
        {intervals.map(int => (
          <button
            key={int.value}
            onClick={() => {
              setActiveInterval(int.value);
              if (onIntervalChange) onIntervalChange(int.value);
            }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: activeInterval === int.value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeInterval === int.value ? 'black' : 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {int.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={options}
          ref={chartComponentRef}
        />

        {/* Position Labels Overlay - PINNED TO LEFT */}
        <div style={{ position: 'absolute', left: '10px', top: '0', bottom: '0', width: '200px', pointerEvents: 'none' }}>
          {positions.map(pos => {
            const y = getYPos(pos.price);
            if (y < 0 || y > 600) return null;
            
            const pnl = pos.type === 'BUY' 
              ? (price - pos.price) * pos.amount 
              : (pos.price - price) * pos.amount;
            const pnlPercent = (pnl / (pos.price * pos.amount)) * 100;

            return (
              <div key={pos.id} style={{
                position: 'absolute',
                left: '0',
                top: `${y + 45}px`, 
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                zIndex: 30,
                pointerEvents: 'auto'
              }}>
                <div style={{
                  background: 'rgba(15, 15, 15, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${pos.type === 'BUY' ? 'rgba(34, 171, 148, 0.6)' : 'rgba(242, 54, 69, 0.6)'}`,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  color: 'white',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: pos.type === 'BUY' ? '#22ab94' : '#f23645', fontWeight: '900' }}>
                    {pos.type} {pos.amount}
                  </span>
                  
                  <span style={{ 
                    color: pnl >= 0 ? '#22ab94' : '#f23645',
                    fontFamily: 'monospace',
                    fontWeight: '700'
                  }}>
                    {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </span>

                  <button 
                    onClick={() => handleCloseTrade(pos.id)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '0.15rem 0.35rem',
                      borderRadius: '3px',
                      fontSize: '0.6rem',
                      fontWeight: '900',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Horizontal Connector Line */}
                <div style={{
                  width: '30px',
                  height: '1px',
                  background: pos.type === 'BUY' ? '#22ab94' : '#f23645',
                  opacity: 0.3
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
