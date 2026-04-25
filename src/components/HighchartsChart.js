"use client";
import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import MouseWheelZoom from 'highcharts/modules/mouse-wheel-zoom';
import { useSession } from "next-auth/react";

// Initialize modules
if (typeof Highcharts === 'object' && typeof window !== 'undefined') {
  MouseWheelZoom(Highcharts);
}

export default function HighchartsChart({ price, history, onIntervalChange }) {
  const chartComponentRef = useRef(null);
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);
  const [activeInterval, setActiveInterval] = useState('1m');
  const customElementsRef = useRef([]);

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

  const renderCustomLabels = (chart) => {
    customElementsRef.current.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    customElementsRef.current = [];

    if (!positions || positions.length === 0) return;

    positions.forEach(pos => {
      const y = chart.yAxis[0].toPixels(pos.price);
      if (y < chart.plotTop || y > chart.plotTop + chart.plotHeight) return;

      const pnl = pos.type === 'BUY' 
        ? (price - pos.price) * pos.amount 
        : (pos.price - price) * pos.amount;
      const pnlPercent = (pnl / (pos.price * pos.amount)) * 100;
      const color = pos.type === 'BUY' ? '#22ab94' : '#f23645';

      const labelText = `${pos.type} ${pos.amount}  ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%  ✕`;
      
      const label = chart.renderer.label(
        labelText,
        chart.plotLeft + 5,
        y - 12,
        'rect',
        null,
        null,
        true
      )
      .attr({
        fill: color,
        padding: 5,
        r: 4,
        zIndex: 10
      })
      .css({
        color: 'white',
        fontSize: '10px',
        fontWeight: '800',
        cursor: 'pointer'
      })
      .on('click', () => handleCloseTrade(pos.id))
      .add();

      customElementsRef.current.push(label);
    });
  };

  const options = {
    chart: {
      backgroundColor: 'transparent',
      height: 600,
      style: { fontFamily: 'Inter, sans-serif' },
      panning: { enabled: true, type: 'x' },
      zoomType: 'x',
      events: {
        render: function() {
          renderCustomLabels(this);
        }
      }
    },
    title: { text: null },
    credits: { enabled: false },
    rangeSelector: { enabled: false },
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    xAxis: {
      gridLineColor: 'rgba(255,255,255,0.03)',
      lineColor: 'rgba(255,255,255,0.1)',
      labels: { style: { color: '#666' } }
    },
    yAxis: {
      gridLineColor: 'rgba(255,255,255,0.03)',
      labels: { align: 'right', x: -5, style: { color: '#666' } },
      opposite: true,
      plotLines: positions.map(pos => ({
        value: pos.price,
        color: pos.type === 'BUY' ? '#22ab94' : '#f23645',
        dashStyle: 'Dash',
        width: 1,
        zIndex: 5
      }))
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

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem', zIndex: 20 }}>
        {['1m', '5m', '15m', '1h', '1D'].map(int => (
          <button
            key={int}
            onClick={() => {
              setActiveInterval(int);
              if (onIntervalChange) onIntervalChange(int.toLowerCase());
            }}
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

      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={options}
        ref={chartComponentRef}
      />
    </div>
  );
}
