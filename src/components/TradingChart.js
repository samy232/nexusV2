"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 42500 },
  { time: '08:00', price: 42300 },
  { time: '12:00', price: 43000 },
  { time: '16:00', price: 42800 },
  { time: '20:00', price: 43500 },
  { time: '23:59', price: 42690 },
];

export default function TradingChart() {
  return (
    <div className="glass" style={{ height: '400px', padding: '1.5rem', flex: 1 }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>BTC/USDT</h2>
          <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>+2.45% (Last 24h)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['1H', '4H', '1D', '1W', '1M'].map(tf => (
            <button key={tf} className="glass" style={{ 
              padding: '0.25rem 0.75rem', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              color: tf === '1D' ? 'var(--accent-primary)' : 'white'
            }}>
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
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
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--card-border)',
              borderRadius: '8px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="var(--accent-primary)" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
