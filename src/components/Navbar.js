"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from "next-auth/react";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export default function Navbar() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [openPositions, setOpenPositions] = useState([]);
  const { price } = usePriceFeed('BTCUSDT', '1m');
  const [activeTab, setActiveTab] = useState('Trader');

  const fetchFinancials = async () => {
    if (!session) return;
    try {
      const userRes = await fetch('/api/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        setBalance(userData.balance || 0);
      }

      const tradesRes = await fetch('/api/trades?status=OPEN');
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setOpenPositions(tradesData || []);
      }
    } catch (e) {
      console.error("Fetch financials failed", e);
    }
  };

  useEffect(() => {
    fetchFinancials();
    const interval = setInterval(fetchFinancials, 5000);
    return () => clearInterval(interval);
  }, [session]);

  // Calculate Live Total PnL (Only if price is valid)
  const totalPnL = (price && price > 0) ? openPositions.reduce((sum, pos) => {
    const pnl = pos.type === 'BUY' 
      ? (price - pos.price) * pos.amount 
      : (pos.price - price) * pos.amount;
    return sum + pnl;
  }, 0) : 0;

  const liveEquity = balance + totalPnL;

  return (
    <nav className="glass" style={{ 
      margin: '0.75rem', 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderRadius: '12px', 
      zIndex: 100,
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '36px', height: '36px', 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #1a8e7a 100%)', 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'black', fontSize: '1.4rem', fontWeight: '900',
            boxShadow: '0 0 15px rgba(34, 171, 148, 0.4)'
          }}>
            N
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>NEXUS</span>
        </Link>

        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '3px', 
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {['Trader', 'Analytic', 'Explorer'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {session && (
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Profit</div>
            <div style={{ 
              fontSize: '1rem', fontWeight: '800', 
              color: totalPnL >= 0 ? '#22ab94' : '#f23645'
            }}>
              {totalPnL !== 0 ? (totalPnL >= 0 ? '+' : '-') : ''}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Equity</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>
              ${liveEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{session.user.name || 'Trader'}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '800' }}>LIVE DEMO</div>
            </div>
            <button 
              onClick={() => signOut()}
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
              className="hover-bright"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            style={{ 
              padding: '0.6rem 1.5rem', 
              background: 'var(--accent-primary)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'black', 
              fontSize: '0.8rem', 
              fontWeight: '800', 
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(34, 171, 148, 0.3)'
            }}
            className="hover-bright"
          >
            SIGN IN
          </button>
        )}
      </div>
    </nav>
  );
}
