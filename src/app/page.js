"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import TradePanel from "@/components/TradePanel";
import OrderBook from "@/components/OrderBook";
import RecentTrades from "@/components/RecentTrades";
import PositionsPanel from "@/components/PositionsPanel";
import { usePriceFeed } from "@/hooks/usePriceFeed";

const TradingViewChart = dynamic(() => import("@/components/TradingViewChart"), {
  ssr: false,
});

export default function Home() {
  const { price } = usePriceFeed();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        padding: '0 1.5rem 1.5rem 1.5rem',
        flex: 1
      }}>
        {/* Left Side: Chart and Positions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <TradingViewChart />
          <PositionsPanel currentPrice={price} />
          <RecentTrades />
        </div>

        {/* Right Side: OrderBook and Trade Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TradePanel currentPrice={price} />
          <OrderBook />
        </div>
      </div>

      {/* Market Ticker Footer */}
      <div className="glass" style={{ 
        margin: '0 1.5rem 1.5rem 1.5rem', 
        padding: '1rem', 
        display: 'flex', 
        gap: '2.5rem', 
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontWeight: '500'
      }}>
        {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOT/USDT', 'LINK/USDT'].map((symbol, i) => (
          <span key={i}>{symbol} LIVE</span>
        ))}
      </div>
    </div>
  );
}
