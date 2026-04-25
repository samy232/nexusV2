import Navbar from "@/components/Navbar";
import TradingChart from "@/components/TradingChart";
import TradePanel from "@/components/TradePanel";
import OrderBook from "@/components/OrderBook";

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
          
          <div className="glass" style={{ padding: '1.5rem', flex: 0.4 }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Recent Transactions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>14:22:01</span>
                    <span style={{ color: i % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>{i % 2 === 0 ? 'BUY' : 'SELL'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>0.0450 BTC</span>
                    <span>$42,690.00</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
