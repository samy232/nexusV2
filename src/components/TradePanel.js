"use client";
import React, { useState } from 'react';
import { useSession } from "next-auth/react";

export default function TradePanel({ currentPrice, symbol, symbolInfo }) {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(0.01);
  const [orderType, setOrderType] = useState('MARKET');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const handleTrade = async (type) => {
    if (!session) return alert("Please sign in to trade");
    setStatus(null);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol || 'BTCUSDT', type, amount, price: currentPrice })
      });
      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus(null), 2000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(null), 2000);
      }
    } catch (e) {
      setStatus('error');
      setTimeout(() => setStatus(null), 2000);
    }
  };

  const displayPrice = currentPrice > 0
    ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 5 })
    : '—';

  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '16px', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Symbol Header */}
      <div style={{ textAlign: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>{symbolInfo?.display || symbol}</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{symbolInfo?.name}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>{displayPrice}</div>
      </div>

      {/* Order Type */}
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
        {['MARKET', 'LIMIT'].map(t => (
          <button key={t} onClick={() => setOrderType(t)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
            fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer',
            background: orderType === t ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: orderType === t ? 'white' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.2s'
          }}>{t}</button>
        ))}
      </div>

      {/* Amount Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Amount</span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
            ≈ ${(amount * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => setAmount(Math.max(0.01, parseFloat((amount - 0.01).toFixed(2))))}
            style={{ width: '40px', height: '42px', border: 'none', background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>-</button>
          <input type="number" value={amount} step="0.01"
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0.01)}
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', textAlign: 'center', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
          />
          <button onClick={() => setAmount(parseFloat((amount + 0.01).toFixed(2)))}
            style={{ width: '40px', height: '42px', border: 'none', background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
        </div>
      </div>

      {/* Leverage */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
        <span>Leverage</span>
        <span style={{ color: 'var(--accent-primary)' }}>100x</span>
      </div>

      {/* Status Flash */}
      {status && (
        <div style={{
          padding: '0.5rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700',
          background: status === 'success' ? 'rgba(34, 171, 148, 0.15)' : 'rgba(242, 54, 69, 0.15)',
          color: status === 'success' ? '#22ab94' : '#f23645',
          border: `1px solid ${status === 'success' ? 'rgba(34,171,148,0.3)' : 'rgba(242,54,69,0.3)'}`
        }}>
          {status === 'success' ? '✓ Order Placed!' : '✕ Order Failed'}
        </div>
      )}

      {/* Buy / Sell */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
        <button onClick={() => handleTrade('BUY')} className="hover-bright" style={{
          flex: 1, padding: '1rem', background: '#22ab94', border: 'none', borderRadius: '12px',
          color: 'black', fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(34, 171, 148, 0.25)'
        }}>BUY</button>
        <button onClick={() => handleTrade('SELL')} className="hover-bright" style={{
          flex: 1, padding: '1rem', background: '#f23645', border: 'none', borderRadius: '12px',
          color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(242, 54, 69, 0.25)'
        }}>SELL</button>
      </div>
    </div>
  );
}
