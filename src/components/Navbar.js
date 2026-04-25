"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export default function Navbar() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [openPositions, setOpenPositions] = useState([]);
  const { price } = usePriceFeed('BTCUSDT', '1m');

  const fetchFinancials = async () => {
    if (!session) return;
    try {
      // Fetch Balance
      const userRes = await fetch('/api/user');
      const userData = await userRes.json();
      setBalance(userData.balance);

      // Fetch Open Positions for PnL calculation
      const tradesRes = await fetch('/api/trades?status=OPEN');
      const tradesData = await tradesRes.json();
      setOpenPositions(tradesData);
    } catch (e) {}
  };

  useEffect(() => {
    fetchFinancials();
    const interval = setInterval(fetchFinancials, 5000);
    return () => clearInterval(interval);
  }, [session]);

  // Calculate Live Total PnL
  const totalPnL = openPositions.reduce((sum, pos) => {
    const pnl = pos.type === 'BUY' 
      ? (price - pos.price) * pos.amount 
      : (pos.price - price) * pos.amount;
    return sum + pnl;
  }, 0);

  const liveEquity = balance + totalPnL;

  return (
    <nav className="glass" style={{ margin: '1rem 1.5rem', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '1.2rem' }}>N</div>
          NEXUS
        </Link>
        
        {session && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {/* Live Balance / Equity */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Live Equity</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                ${liveEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total PnL Meter */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Floating PnL</span>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: '800', 
                color: totalPnL >= 0 ? '#22ab94' : '#f23645',
                textShadow: totalPnL !== 0 ? `0 0 10px ${totalPnL >= 0 ? 'rgba(34, 171, 148, 0.3)' : 'rgba(242, 54, 69, 0.3)'}` : 'none'
              }}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {session ? (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{session.user.name || session.user.email}</div>
              <div style={{ fontSize: '0.7rem', color: '#22ab94', fontWeight: '700' }}>DEMO ACCOUNT</div>
            </div>
            <button 
              onClick={() => signOut()}
              style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
              className="hover-bright"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/auth/signin">
            <button className="btn-primary">Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
