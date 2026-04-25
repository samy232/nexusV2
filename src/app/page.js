"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import TradePanel from "@/components/TradePanel";
import RecentTrades from "@/components/RecentTrades";
import PositionsPanel from "@/components/PositionsPanel";
import Watchlist from "@/components/Watchlist";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { getSymbolInfo, DEFAULT_SYMBOL } from "@/lib/symbols";
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import("@/components/HighchartsChart"), { ssr: false });

export default function Home() {
  const [interval, setInterval] = useState('1m');
  const [activeTab, setActiveTab] = useState('positions');
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const { price, history, quote } = usePriceFeed(selectedSymbol, interval);
  const symbolInfo = getSymbolInfo(selectedSymbol);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', overflow: 'hidden' }}>
      <Navbar />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 300px',
        gridTemplateRows: '1fr 220px',
        gap: '0.5rem',
        padding: '0 0.5rem 0.5rem 0.5rem',
        flex: 1,
        overflow: 'hidden'
      }}>
        
        {/* LEFT SIDEBAR: Watchlist */}
        <div style={{ gridRow: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
          <Watchlist activeSymbol={selectedSymbol} onSymbolSelect={setSelectedSymbol} />
        </div>

        {/* CENTER: Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
          {/* Market Stats Bar */}
          <div className="glass" style={{ padding: '0.6rem 1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: '900', fontSize: '1rem' }}>{symbolInfo?.display || selectedSymbol}</span>
              <span style={{
                fontSize: '0.8rem', fontWeight: '700',
                color: (quote?.changePercent || 0) >= 0 ? '#22ab94' : '#f23645'
              }}>
                {(quote?.changePercent || 0) >= 0 ? '+' : ''}{(quote?.changePercent || 0).toFixed(2)}%
              </span>
            </div>
            <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
              <div><span style={{ color: '#555' }}>Price: </span><span style={{ fontWeight: '700', color: 'white' }}>{price > 0 ? price.toLocaleString(undefined, { maximumFractionDigits: 5 }) : '—'}</span></div>
              {quote?.high && <div><span style={{ color: '#555' }}>H: </span><span style={{ fontWeight: '600' }}>{quote.high.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span></div>}
              {quote?.low && <div><span style={{ color: '#555' }}>L: </span><span style={{ fontWeight: '600' }}>{quote.low.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span></div>}
              {quote?.volume > 0 && <div><span style={{ color: '#555' }}>Vol: </span><span style={{ fontWeight: '600' }}>{(quote.volume / 1e6).toFixed(1)}M</span></div>}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <DynamicChart
              price={price}
              history={history}
              symbol={selectedSymbol}
              onIntervalChange={setInterval}
            />
          </div>
        </div>

        {/* RIGHT: Trade Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TradePanel currentPrice={price} symbol={selectedSymbol} symbolInfo={symbolInfo} />
        </div>

        {/* BOTTOM PANEL: Positions & History (spans center + right) */}
        <div className="glass" style={{ gridColumn: '2 / span 2', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            {['positions', 'history'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '0.9rem 0', background: 'none', border: 'none',
                color: activeTab === tab ? 'white' : '#666',
                fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                textTransform: 'uppercase', transition: 'all 0.2s'
              }}>
                {tab === 'positions' ? 'Active Positions' : 'Trade History'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'positions' ? <PositionsPanel currentPrice={price} /> : <RecentTrades />}
          </div>
        </div>
      </div>
    </div>
  );
}
