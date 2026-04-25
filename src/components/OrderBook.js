"use client";

const bids = [
  { price: 42685.50, amount: 1.25, total: 53356.88 },
  { price: 42684.00, amount: 0.85, total: 36281.40 },
  { price: 42683.20, amount: 2.10, total: 89634.72 },
  { price: 42682.10, amount: 0.45, total: 19206.95 },
];

const asks = [
  { price: 42691.50, amount: 0.65, total: 27749.48 },
  { price: 42692.00, amount: 1.45, total: 61903.40 },
  { price: 42693.20, amount: 0.90, total: 38423.88 },
  { price: 42694.10, amount: 3.20, total: 136621.12 },
];

export default function OrderBook() {
  return (
    <div className="glass" style={{ width: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Order Book</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingBottom: '0.5rem' }}>
          <span>Price</span>
          <span>Amount</span>
        </div>
        
        {/* Asks */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
          {asks.map((ask, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.875rem',
              color: 'var(--accent-danger)',
              position: 'relative'
            }}>
              <span>{ask.price.toFixed(2)}</span>
              <span>{ask.amount.toFixed(4)}</span>
              <div style={{ 
                position: 'absolute', 
                right: 0, 
                height: '100%', 
                width: `${(ask.amount/4)*100}%`, 
                background: 'rgba(255, 77, 77, 0.1)',
                zIndex: -1 
              }} />
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div style={{ padding: '0.75rem 0', textAlign: 'center', fontSize: '1.25rem', fontWeight: '700', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', margin: '0.5rem 0' }}>
          42,690.00
        </div>

        {/* Bids */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {bids.map((bid, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.875rem',
              color: 'var(--accent-primary)',
              position: 'relative'
            }}>
              <span>{bid.price.toFixed(2)}</span>
              <span>{bid.amount.toFixed(4)}</span>
              <div style={{ 
                position: 'absolute', 
                right: 0, 
                height: '100%', 
                width: `${(bid.amount/4)*100}%`, 
                background: 'rgba(0, 255, 136, 0.1)',
                zIndex: -1 
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
