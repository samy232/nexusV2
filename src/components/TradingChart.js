"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePriceFeed } from '@/hooks/usePriceFeed';

export default function TradingChart() {
  const { price } = usePriceFeed();
  const [data, setData] = useState([]);

  // Initialize with some dummy data for context
  useEffect(() => {
    const initialData = Array.from({ length: 50 }, (_, i) => ({
      time: new Date(Date.now() - (50 - i) * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: 42000 + Math.random() * 500
    }));
    setData(initialData);
  }, []);

  // Update data with live price
  useEffect(() => {
    if (price) {
      setData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: price
        }];
        return newData.slice(-50); // Keep last 50 points
      });
    }
  }, [price]);

  return (
    <div className="glass" style={{ height: '400px', padding: '1.5rem', flex: 1 }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>BTC/USDT</h2>
          <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: '800' }}>
            ${price?.toLocaleString() || '42,690.00'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['LIVE', '1H', '4H', '1D'].map(tf => (
            <button key={tf} className="glass" style={{ 
              padding: '0.25rem 0.75rem', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              borderColor: tf === 'LIVE' ? 'var(--accent-primary)' : 'var(--card-border)',
              color: tf === 'LIVE' ? 'var(--accent-primary)' : 'white'
            }}>
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="var(--text-secondary)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            interval={10}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--card-border)',
              borderRadius: '8px',
              fontSize: '12px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="var(--accent-primary)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
