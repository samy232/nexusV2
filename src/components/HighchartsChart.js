"use client";
import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useSession } from "next-auth/react";

export default function HighchartsChart({ price, history, onIntervalChange }) {
  const chartComponentRef = useRef(null);
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' or 'area'
  const [activeInterval, setActiveInterval] = useState('1m');

  const intervals = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '1D', value: '1d' },
  ];

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
    const interval = setInterval(fetchPositions, 10000);
    return () => clearInterval(interval);
  }, [session]);

  const options = {
    chart: {
      backgroundColor: 'transparent',
      height: 550,
      style: { fontFamily: 'Inter, sans-serif' }
    },
    title: { text: null },
    credits: { enabled: false },
    rangeSelector: { enabled: false }, // Using custom selectors
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
        width: 2,
        zIndex: 5,
        label: {
          text: `${pos.type} ${pos.amount} @ ${pos.price}`,
          align: 'right',
          x: -10,
          style: { color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px', borderRadius: '4px', fontSize: '10px' }
        }
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
      },
      area: {
        color: '#2962FF',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, 'rgba(41, 98, 255, 0.3)'], [1, 'rgba(41, 98, 255, 0)']]
        }
      }
    },
    series: [{
      name: 'BTC/USDT',
      data: history || [],
      type: chartType,
      id: 'main-series',
      tooltip: { valueDecimals: 2 }
    }]
  };

  const handleIntervalClick = (val) => {
    setActiveInterval(val);
    if (onIntervalChange) onIntervalChange(val);
  };

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Chart Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {int.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
          {['candlestick', 'area'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: chartType === type ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {type === 'candlestick' ? 'Candles' : 'Line'}
            </button>
          ))}
        </div>
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={options}
        ref={chartComponentRef}
      />
    </div>
  );
}
