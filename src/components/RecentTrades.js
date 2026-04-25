"use client";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

export default function RecentTrades() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (session) {
      fetch('/api/trades')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTrades(data);
        });
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className="glass" style={{ padding: '1.5rem', flex: 0.4 }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Recent Transactions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {trades.length > 0 ? trades.map((trade, i) => (
          <div key={trade.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ color: trade.type === 'BUY' ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
                {trade.type}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span>{trade.amount.toFixed(4)} {trade.symbol.split('/')[0]}</span>
              <span>${trade.price.toLocaleString()}</span>
            </div>
          </div>
        )) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
            No recent trades found
          </div>
        )}
      </div>
    </div>
  );
}
