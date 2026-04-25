"use client";
import React, { useState } from 'react';
import { useSession } from "next-auth/react";

export default function TradePanel({ currentPrice }) {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(0.01);
  const [orderType, setOrderType] = useState('MARKET');

  const handleTrade = async (type) => {
    if (!session) return alert("Please sign in to trade");
    
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          type,
          amount,
          price: currentPrice,
        })
      });
      
      if (res.ok) {
        // Notification or sound effect could go here
      }
    } catch (e) {
      console.error("Trade failed", e);
    }
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '16px' }}>
      {/* Order Type Selector */}
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
        {['MARKET', 'LIMIT'].map(t => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              background: orderType === t ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: orderType === t ? 'white' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Amount</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Approx. ${(amount * currentPrice).toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', padding: '0.25rem' }}>
          <button 
            onClick={() => setAmount(Math.max(0.01, parseFloat((amount - 0.01).toFixed(2))))}
            style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
          >-</button>
          <input 
            type="number" 
            value={amount}
            step="0.01"
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0.01)}
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', textAlign: 'center', fontSize: '1.1rem', fontWeight: '800', outline: 'none' }}
          />
          <button 
            onClick={() => setAmount(parseFloat((amount + 0.01).toFixed(2)))}
            style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
          >+</button>
        </div>
      </div>

      {/* Leverage Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
        <span>Leverage</span>
        <span style={{ color: 'var(--accent-primary)' }}>100x</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => handleTrade('BUY')}
          style={{
            flex: 1,
            padding: '1rem',
            background: '#22ab94',
            border: 'none',
            borderRadius: '12px',
            color: 'black',
            fontWeight: '900',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34, 171, 148, 0.2)',
            transition: 'transform 0.1s active'
          }}
          className="hover-bright"
        >
          BUY
        </button>
        <button
          onClick={() => handleTrade('SELL')}
          style={{
            flex: 1,
            padding: '1rem',
            background: '#f23645',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '900',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(242, 54, 69, 0.2)'
          }}
          className="hover-bright"
        >
          SELL
        </button>
      </div>
    </div>
  );
}
