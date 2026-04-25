"use client";
import { useState, useEffect } from 'react';
import { SYMBOL_CATEGORIES } from '@/lib/symbols';

function SymbolRow({ symbol, isActive, onSelect }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/market/price?symbol=${symbol.id}`);
        const data = await res.json();
        if (data.price) setQuote(data);
      } catch (e) {}
    };
    fetchQuote();
    const interval = setInterval(fetchQuote, 5000);
    return () => clearInterval(interval);
  }, [symbol.id]);

  const isPositive = (quote?.changePercent || 0) >= 0;

  return (
    <div
      onClick={() => onSelect(symbol.id)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        background: isActive ? 'rgba(34, 171, 148, 0.1)' : 'transparent',
        border: isActive ? '1px solid rgba(34, 171, 148, 0.3)' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
      className="hover-bright"
    >
      <div>
        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'white' }}>{symbol.display}</div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{symbol.name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'white' }}>
          {quote?.price
            ? symbol.id.includes('USDT') || ['EURUSD','GBPUSD','AUDUSD','USDCAD'].includes(symbol.id)
              ? quote.price < 10 ? quote.price.toFixed(5) : quote.price.toFixed(2)
              : quote.price.toFixed(2)
            : '—'}
        </div>
        {quote && (
          <div style={{ fontSize: '0.65rem', color: isPositive ? '#22ab94' : '#f23645', marginTop: '1px' }}>
            {isPositive ? '+' : ''}{quote.changePercent?.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function Watchlist({ activeSymbol, onSymbolSelect }) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '12px' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '800', fontSize: '0.8rem', color: 'white' }}>
        Market Watch
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {Object.entries(SYMBOL_CATEGORIES).map(([key, category]) => (
          <div key={key} style={{ marginBottom: '0.5rem' }}>
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0.5rem',
                cursor: 'pointer',
                borderRadius: '6px',
              }}
            >
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: category.color, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {category.label}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                {collapsed[key] ? '▶' : '▼'}
              </span>
            </div>

            {/* Symbol Rows */}
            {!collapsed[key] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {category.symbols.map(symbol => (
                  <SymbolRow
                    key={symbol.id}
                    symbol={symbol}
                    isActive={activeSymbol === symbol.id}
                    onSelect={onSymbolSelect}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
