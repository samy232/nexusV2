"use client";
import { useState } from 'react';

export default function TradePanel() {
  const [type, setType] = useState('buy');

  return (
    <div className="glass" style={{ width: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setType('buy')}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: type === 'buy' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            color: type === 'buy' ? 'black' : 'white',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          BUY
        </button>
        <button 
          onClick={() => setType('sell')}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: type === 'sell' ? 'var(--accent-danger)' : 'rgba(255,255,255,0.05)',
            color: type === 'sell' ? 'white' : 'white',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          SELL
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Price (USDT)</label>
          <input 
            type="number" 
            defaultValue="42690"
            className="glass"
            style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount (BTC)</label>
          <input 
            type="number" 
            placeholder="0.00"
            className="glass"
            style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Fee</span>
          <span>0.1%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span>$0.00</span>
        </div>
      </div>

      <button style={{
        padding: '1rem',
        borderRadius: '8px',
        border: 'none',
        background: type === 'buy' ? 'var(--accent-primary)' : 'var(--accent-danger)',
        color: type === 'buy' ? 'black' : 'white',
        fontWeight: '800',
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        {type === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
      </button>
    </div>
  );
}
