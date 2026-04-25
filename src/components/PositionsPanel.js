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
    const interval = setInterval(fetchPositions, 5000);
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

  // Format amount: remove trailing zeros (0.0100 → 0.01)
  const formatAmount = (val) => parseFloat(val.toFixed(8)).toString();

  // Format open time nicely
  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!session || positions.length === 0) return (
    <div style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
      No open positions
    </div>
  );

  return (
    <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {positions.map((pos) => {
        const pnl = pos.type === 'BUY'
          ? (currentPrice - pos.price) * pos.amount
          : (pos.price - currentPrice) * pos.amount;
        const pnlPercent = (pnl / (pos.price * pos.amount)) * 100;
        const isProfit = pnl >= 0;
        const themeColor = pos.type === 'BUY' ? '#22ab94' : '#f23645';

        return (
          <div key={pos.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${themeColor}33`,
          }}>
            {/* Left: Position Info */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              {/* Type Badge */}
              <div style={{
                background: `${themeColor}22`,
                border: `1px solid ${themeColor}`,
                color: themeColor,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontWeight: '900',
                fontSize: '0.7rem',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {pos.type}
              </div>

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '2px' }}>Symbol</div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{pos.symbol}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '2px' }}>Amount</div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{formatAmount(pos.amount)}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '2px' }}>Entry Price</div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>${pos.price.toLocaleString()}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '2px' }}>Opened</div>
                <div style={{ fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  {formatTime(pos.timestamp)}
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '2px' }}>PnL</div>
                <div style={{ color: isProfit ? '#22ab94' : '#f23645', fontWeight: '800', fontSize: '0.85rem' }}>
                  {isProfit ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleClose(pos.id)}
              disabled={loading === pos.id}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid rgba(242,54,69,0.3)',
                background: 'rgba(242,54,69,0.1)',
                color: '#f23645',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {loading === pos.id ? '...' : 'Close'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
