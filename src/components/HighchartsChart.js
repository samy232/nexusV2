"use client";
import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useSession } from "next-auth/react";

export default function HighchartsChart({ price, history }) {
  const chartComponentRef = useRef(null);
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);

  // Fetch open positions to draw lines
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
      height: 500,
      style: { fontFamily: 'Inter, sans-serif' }
    },
    title: { text: null },
    credits: { enabled: false },
    rangeSelector: {
      enabled: true,
      inputEnabled: false,
      buttonTheme: {
        fill: 'rgba(255,255,255,0.05)',
        stroke: 'none',
        'stroke-width': 0,
        r: 4,
        style: { color: '#ccc', fontWeight: 'bold' },
        states: {
          select: { fill: 'var(--accent-primary)', style: { color: 'black' } }
        }
      }
    },
    navigator: {
      enabled: true,
      maskFill: 'rgba(41, 98, 255, 0.1)',
      outlineColor: 'rgba(255,255,255,0.1)'
    },
    scrollbar: { enabled: false },
    xAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      lineColor: 'rgba(255,255,255,0.1)',
      tickColor: 'rgba(255,255,255,0.1)',
      labels: { style: { color: '#888' } }
    },
    yAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: { 
        align: 'right', 
        x: -5,
        style: { color: '#888' } 
      },
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
          style: { color: 'white', fontWeight: 'bold', fontSize: '10px' }
        }
      }))
    },
    series: [{
      name: 'BTC/USDT',
      data: history ? history.map(h => [h.time * 1000, h.value]) : [],
      type: 'area',
      threshold: null,
      tooltip: { valueDecimals: 2 },
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'rgba(41, 98, 255, 0.3)'],
          [1, 'rgba(41, 98, 255, 0)']
        ]
      },
      color: '#2962FF'
    }]
  };

  // Update live price
  useEffect(() => {
    if (chartComponentRef.current && price) {
      const chart = chartComponentRef.current.chart;
      const series = chart.series[0];
      const time = Date.now();
      series.addPoint([time, price], true, series.data.length > 500);
    }
  }, [price]);

  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', overflow: 'hidden' }}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={options}
        ref={chartComponentRef}
      />
    </div>
  );
}
