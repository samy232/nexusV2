"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function TradePanel({ currentPrice }) {
  const { data: session } = useSession();
  const [type, setType] = useState('buy');
  const [price, setPrice] = useState(currentPrice || 42690);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (currentPrice && !price) setPrice(currentPrice);
  }, [currentPrice]);

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
        setStatus({ type: 'success', message: 'Order placed successfully!' });
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="glass"
            style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount (BTC)</label>
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

      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Fee</span>
          <span>0.1%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span>${total}</span>
        </div>
      </div>

      {status && (
        <div style={{ 
          fontSize: '0.875rem', 
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
          padding: '1rem',
          borderRadius: '8px',
          border: 'none',
          background: type === 'buy' ? 'var(--accent-primary)' : 'var(--accent-danger)',
          color: type === 'buy' ? 'black' : 'white',
          fontWeight: '800',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Processing...' : (type === 'buy' ? 'Place Buy Order' : 'Place Sell Order')}
      </button>
    </div>
  );
}
