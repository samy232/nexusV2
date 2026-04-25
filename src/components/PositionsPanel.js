"use client";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

export default function PositionsPanel({ currentPrice }) {
  const { data: session } = useSession();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = async () => {
    if (!session) return;
    const res = await fetch('/api/trades?status=OPEN');
    const data = await res.json();
    if (Array.isArray(data)) setPositions(data);
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000); // Refresh list every 5s
    return () => clearInterval(interval);
  }, [session]);

  const handleClose = async (id) => {
    setLoading(id);
    try {
      const res = await fetch('/api/trades/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId: id, exitPrice: currentPrice })
      });
      if (res.ok) fetchPositions();
    } catch (err) {
      console.error("Failed to close trade", err);
    } finally {
      setLoading(false);
    }
  };

  if (!session || positions.length === 0) return null;

  return (
    <div className="glass" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Active Positions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {positions.map((pos) => {
          const pnl = (currentPrice - pos.price) * pos.amount;
          const pnlPercent = ((currentPrice - pos.price) / pos.price) * 100;
          const isProfit = pnl >= 0;

          return (
            <div key={pos.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '0.875rem', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Symbol</div>
                  <div style={{ fontWeight: '600' }}>{pos.symbol}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Size</div>
                  <div>{pos.amount.toFixed(4)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Entry</div>
                  <div>${pos.price.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PnL</div>
                  <div style={{ color: isProfit ? 'var(--accent-primary)' : 'var(--accent-danger)', fontWeight: '700' }}>
                    {isProfit ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleClose(pos.id)}
                disabled={loading === pos.id}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading === pos.id ? '...' : 'Close'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
