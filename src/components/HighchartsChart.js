"use client";
import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useSession } from "next-auth/react";

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
      spacingRight: 100 // Room for labels
    },
    title: { text: null },
    credits: { enabled: false },
    rangeSelector: { enabled: false },
    navigator: {
      enabled: true,
      maskFill: 'rgba(41, 98, 255, 0.05)',
      outlineColor: 'rgba(255,255,255,0.05)',
      series: { color: 'var(--accent-primary)', fillOpacity: 0.05 }
    },
    scrollbar: { enabled: false },
    xAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      lineColor: 'rgba(255,255,255,0.1)',
      labels: { style: { color: '#888' } }
    },
    yAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: { align: 'right', x: -5, style: { color: '#888' } },
      opposite: true,
      plotLines: positions.map(pos => ({
        value: pos.price,
        color: pos.type === 'BUY' ? '#22ab94' : '#f23645',
        dashStyle: 'Dash',
        width: 1,
        zIndex: 5
      }))
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      style: { color: '#fff' },
      borderWidth: 0,
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
      id: 'main-series'
    }]
  };

  const handleIntervalClick = (val) => {
    setActiveInterval(val);
    if (onIntervalChange) onIntervalChange(val);
  };

  // Helper to get Y pixel for a price
  const getYPos = (p) => {
    if (!chartComponentRef.current) return -100;
    const chart = chartComponentRef.current.chart;
    return chart.yAxis[0].toPixels(p) - chart.plotTop;
  };

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      {/* Chart Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem' }}>
        {intervals.map(int => (
          <button
            key={int.value}
            onClick={() => handleIntervalClick(int.value)}
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

        {/* Position Labels Overlay */}
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
              right: '10px',
              top: `${y + 40}px`, // Offset for chart title/controls
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10,
              pointerEvents: 'auto'
            }}>
              <div style={{
                background: pos.type === 'BUY' ? 'rgba(34, 171, 148, 0.9)' : 'rgba(242, 54, 69, 0.9)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                gap: '0.5rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{pos.type} {pos.amount}</span>
                <span style={{ opacity: 0.8 }}>|</span>
                <span style={{ color: pnl >= 0 ? '#afffe4' : '#ffd1d1' }}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                </span>
              </div>
              <button 
                onClick={() => handleCloseTrade(pos.id)}
                style={{
                  background: 'white',
                  border: 'none',
                  color: 'black',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                CLOSE
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
