"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from "next-auth/react";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export default function Navbar() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [accountType, setAccountType] = useState('DEMO');
  const [leverage, setLeverage] = useState(100);
  const [openPositions, setOpenPositions] = useState([]);
  const { price } = usePriceFeed('BTCUSDT', '1m');
  const [activeTab, setActiveTab] = useState('Trader');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const fetchFinancials = async () => {
    if (!session) return;
    try {
      const userRes = await fetch('/api/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        setBalance(userData.balance || 0);
        setAccountType(userData.accountType);
        setLeverage(userData.leverage);
      }

      const tradesRes = await fetch('/api/trades?status=OPEN');
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setOpenPositions(tradesData || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchFinancials();
    const interval = setInterval(fetchFinancials, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPnL = (price && price > 0) ? openPositions.reduce((sum, pos) => {
    const pnl = pos.type === 'BUY' 
      ? (price - pos.price) * pos.amount 
      : (pos.price - price) * pos.amount;
    return sum + pnl;
  }, 0) : 0;

  const liveEquity = balance + totalPnL;

  const handleAccountAction = async (action, value) => {
    try {
      const res = await fetch('/api/user/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value })
      });
      if (res.ok) {
        fetchFinancials();
        if (action === 'SWITCH_ACCOUNT') setShowProfileMenu(false);
      }
    } catch (e) {}
  };

  return (
    <nav className="glass" style={{ margin: '0.75rem', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', zIndex: 100, border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #1a8e7a 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '1.4rem', fontWeight: '900', boxShadow: '0 0 15px rgba(34, 171, 148, 0.4)' }}>
            N
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>NEXUS</span>
        </Link>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {['Trader', 'Analytic', 'Explorer'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1.2rem', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {session && (
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Floating PnL</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: totalPnL >= 0 ? '#22ab94' : '#f23645' }}>
              {totalPnL !== 0 ? (totalPnL >= 0 ? '+' : '-') : ''}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {accountType} Equity
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>
              ${liveEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }} ref={menuRef}>
        {session ? (
          <>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', transition: 'background 0.2s' }}
              className="hover-bright"
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{session.user.name || 'Trader'}</div>
                <div style={{ fontSize: '0.65rem', color: accountType === 'LIVE' ? '#ff9900' : 'var(--accent-primary)', fontWeight: '800' }}>
                  {accountType} ACCOUNT
                </div>
              </div>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
            </div>

            {showProfileMenu && (
              <div className="glass" style={{ position: 'absolute', top: '120%', right: 0, width: '240px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 200 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>ACCOUNT MODE</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleAccountAction('SWITCH_ACCOUNT', 'DEMO')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: accountType === 'DEMO' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: accountType === 'DEMO' ? 'black' : 'white', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                    >DEMO</button>
                    <button 
                      onClick={() => handleAccountAction('SWITCH_ACCOUNT', 'LIVE')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: accountType === 'LIVE' ? '#ff9900' : 'rgba(255,255,255,0.05)', color: accountType === 'LIVE' ? 'black' : 'white', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                    >LIVE</button>
                  </div>
                </div>

                {accountType === 'DEMO' && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>DEMO BALANCE</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input 
                          type="number" 
                          placeholder="Balance"
                          defaultValue={balance}
                          onBlur={(e) => handleAccountAction('UPDATE_DEMO_BALANCE', e.target.value)}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.4rem', color: 'white', fontSize: '0.75rem' }}
                        />
                        <button 
                          onClick={() => handleAccountAction('RESET_DEMO')}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                        >Reset</button>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <button onClick={() => signOut()} style={{ padding: '0.6rem', background: 'rgba(242, 54, 69, 0.1)', border: '1px solid rgba(242, 54, 69, 0.2)', borderRadius: '6px', color: '#f23645', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => signIn()} style={{ padding: '0.6rem 1.5rem', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: 'black', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(34, 171, 148, 0.3)' }} className="hover-bright">
            SIGN IN
          </button>
        )}
      </div>
    </nav>
  );
}
