"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function TradePanel({ currentPrice }) {
  const { data: session } = useSession();
  const [type, setType] = useState('buy');
  const [orderMode, setOrderMode] = useState('market'); // 'market' or 'limit'
  const [price, setPrice] = useState(currentPrice || 42690);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Sync price in Market mode
  useEffect(() => {
    if (orderMode === 'market' && currentPrice) {
      setPrice(currentPrice);
    }
  }, [currentPrice, orderMode]);

  const handleSubmit = async () => {
    if (!session) {
      setStatus({ type: 'error', message: 'Please sign in to trade' });
      return;
    }

    if (!amount || amount <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTC/USDT',
          type: type.toUpperCase(),
          amount: parseFloat(amount),
          price: parseFloat(price)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: `${type.toUpperCase()} Order executed!` });
        setAmount('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to place order' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const total = (parseFloat(amount || 0) * price).toFixed(2);

  return (
    <div className="glass" style={{ width: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Side Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
        <button 
          onClick={() => setType('buy')}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '6px',
            border: 'none',
            background: type === 'buy' ? 'var(--accent-primary)' : 'transparent',
            color: type === 'buy' ? 'black' : 'var(--text-secondary)',
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
            padding: '0.6rem',
            borderRadius: '6px',
            border: 'none',
            background: type === 'sell' ? 'var(--accent-danger)' : 'transparent',
            color: type === 'sell' ? 'white' : 'var(--text-secondary)',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          SELL
        </button>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
        {['market', 'limit'].map(mode => (
          <button 
            key={mode}
            onClick={() => setOrderMode(mode)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: orderMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'capitalize',
              padding: 0
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price (USDT)</label>
          <input 
            type="number" 
            value={price}
            readOnly={orderMode === 'market'}
            onChange={(e) => setPrice(e.target.value)}
            className="glass"
            style={{ 
              padding: '0.75rem', 
              background: orderMode === 'market' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--card-border)', 
              color: orderMode === 'market' ? 'var(--text-secondary)' : 'white', 
              outline: 'none' 
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount (BTC)</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="glass"
            style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Trading Fee</span>
          <span>0.1%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total Cost</span>
          <span style={{ color: 'white' }}>${total}</span>
        </div>
      </div>

      {status && (
        <div style={{ 
          fontSize: '0.75rem', 
          textAlign: 'center', 
          color: status.type === 'success' ? 'var(--accent-primary)' : 'var(--accent-danger)',
          padding: '0.5rem',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          {status.message}
        </div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '0.9rem',
          borderRadius: '8px',
          border: 'none',
          background: type === 'buy' ? 'var(--accent-primary)' : 'var(--accent-danger)',
          color: type === 'buy' ? 'black' : 'white',
          fontWeight: '800',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          opacity: loading ? 0.7 : 1,
          boxShadow: type === 'buy' ? '0 0 20px rgba(0, 255, 178, 0.2)' : 'none'
        }}
      >
        {loading ? 'Executing...' : `${type.toUpperCase()} BTC`}
      </button>
    </div>
  );
}
