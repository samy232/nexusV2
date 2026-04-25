"use client";
import React from 'react';

export default function Watchlist() {
  const assets = [
    { symbol: 'BTC/USDT', price: '42,690.00', change: '+2.4%' },
    { symbol: 'ETH/USDT', price: '2,324.41', change: '-1.1%' },
    { symbol: 'SOL/USDT', price: '98.50', change: '+5.7%' },
    { symbol: 'DOT/USDT', price: '7.20', change: '-0.4%' },
    { symbol: 'LINK/USDT', price: '18.10', change: '+3.2%' },
  ];

  return (
    <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', fontSize: '0.9rem' }}>
        Market Watchlist
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {assets.map((asset, i) => (
          <div key={i} style={{ 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }} className="hover-bright">
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{asset.symbol}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>24h Vol: $1.2B</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{asset.price}</div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: asset.change.startsWith('+') ? '#22ab94' : '#f23645',
                fontWeight: '700'
              }}>
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
