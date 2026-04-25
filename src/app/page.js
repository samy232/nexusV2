import Navbar from "@/components/Navbar";
import TradingChart from "@/components/TradingChart";
import TradePanel from "@/components/TradePanel";
import OrderBook from "@/components/OrderBook";
import RecentTrades from "@/components/RecentTrades";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        padding: '0 1rem 1rem 1rem',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Side: Chart and Market Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <TradingChart />
          <RecentTrades />
        </div>

        {/* Right Side: OrderBook and Trade Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <OrderBook />
          <TradePanel />
        </div>
      </div>

      {/* Market Ticker Footer */}
      <div className="glass" style={{ 
        margin: '0 1rem 1rem 1rem', 
        padding: '0.75rem', 
        display: 'flex', 
        gap: '2rem', 
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        {['BTC/USDT $42,690.00 (+2.4%)', 'ETH/USDT $2,450.12 (-1.2%)', 'SOL/USDT $145.67 (+5.8%)', 'DOT/USDT $7.23 (+0.5%)', 'LINK/USDT $18.45 (-0.1%)'].map((ticker, i) => (
          <span key={i}>{ticker}</span>
        ))}
      </div>
    </div>
  );
}
