"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import HighchartsChart from "@/components/HighchartsChart";
import TradePanel from "@/components/TradePanel";
import RecentTrades from "@/components/RecentTrades";
import PositionsPanel from "@/components/PositionsPanel";
import Watchlist from "@/components/Watchlist";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import("@/components/HighchartsChart"), {
  ssr: false,
});

export default function Home() {
  const [interval, setInterval] = useState('1m');
  const [activeTab, setActiveTab] = useState('positions'); 
  const { price, history } = usePriceFeed('BTCUSDT', interval);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', overflow: 'hidden' }}>
      <Navbar />
      
      {/* 3-Column Pro Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '280px 1fr 320px', 
        gridTemplateRows: '1fr 220px', 
        gap: '0.75rem', 
        padding: '0.75rem',
        flex: 1,
        overflow: 'hidden'
      }}>
        
        {/* LEFT SIDEBAR: Watchlist & News */}
        <div style={{ gridRow: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
          <Watchlist />
          <div className="glass" style={{ height: '30%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Market News
            </div>
            <div style={{ padding: '1rem', fontSize: '0.75rem', color: '#888', lineHeight: '1.4' }}>
              <p style={{ marginBottom: '0.5rem' }}>• BTC remains steady above $42k as ETF flows stabilize.</p>
              <p>• ETH layer-2 activity reaches all-time high this week.</p>
            </div>
          </div>
        </div>

        {/* CENTER: The Pro Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
          {/* Market Stats Top Bar */}
          <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>BTC/USDT</span>
              <span style={{ color: '#22ab94', fontSize: '0.8rem', fontWeight: '700' }}>+2.45%</span>
            </div>
            <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.75rem' }}>
              <div><span style={{ color: '#666' }}>High:</span> <span style={{ fontWeight: '600' }}>43,120.00</span></div>
              <div><span style={{ color: '#666' }}>Low:</span> <span style={{ fontWeight: '600' }}>41,850.00</span></div>
              <div><span style={{ color: '#666' }}>Volume:</span> <span style={{ fontWeight: '600' }}>1.2B USDT</span></div>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <DynamicChart 
              price={price} 
              history={history} 
              onIntervalChange={setInterval}
            />
          </div>
        </div>

        {/* RIGHT: Trade Panel (Execution Zone) */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TradePanel currentPrice={price} />
        </div>

        {/* EXPANDED BOTTOM PANEL: Positions & History */}
        <div className="glass" style={{ 
          gridColumn: '2 / span 2', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['positions', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 0',
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab ? 'white' : '#666',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'positions' ? 'Active Positions' : 'Trade History'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'positions' ? (
              <PositionsPanel currentPrice={price} />
            ) : (
              <RecentTrades />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
