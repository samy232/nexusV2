// Central symbol registry for all tradable assets

export const SYMBOL_CATEGORIES = {
  CRYPTO: {
    label: 'Crypto',
    color: '#f7931a',
    symbols: [
      { id: 'BTCUSDT', display: 'BTC/USDT', name: 'Bitcoin', source: 'binance' },
      { id: 'ETHUSDT', display: 'ETH/USDT', name: 'Ethereum', source: 'binance' },
      { id: 'SOLUSDT', display: 'SOL/USDT', name: 'Solana', source: 'binance' },
      { id: 'XRPUSDT', display: 'XRP/USDT', name: 'XRP', source: 'binance' },
      { id: 'BNBUSDT', display: 'BNB/USDT', name: 'BNB', source: 'binance' },
      { id: 'ADAUSDT', display: 'ADA/USDT', name: 'Cardano', source: 'binance' },
    ]
  },
  FOREX: {
    label: 'Forex',
    color: '#4fc3f7',
    symbols: [
      { id: 'EURUSD', display: 'EUR/USD', name: 'Euro / Dollar', source: 'yahoo', yahooId: 'EURUSD=X' },
      { id: 'GBPUSD', display: 'GBP/USD', name: 'Pound / Dollar', source: 'yahoo', yahooId: 'GBPUSD=X' },
      { id: 'USDJPY', display: 'USD/JPY', name: 'Dollar / Yen', source: 'yahoo', yahooId: 'USDJPY=X' },
      { id: 'AUDUSD', display: 'AUD/USD', name: 'Aussie / Dollar', source: 'yahoo', yahooId: 'AUDUSD=X' },
      { id: 'USDCAD', display: 'USD/CAD', name: 'Dollar / CAD', source: 'yahoo', yahooId: 'USDCAD=X' },
    ]
  },
  METALS: {
    label: 'Metals',
    color: '#ffd700',
    symbols: [
      { id: 'XAUUSD', display: 'XAU/USD', name: 'Gold', source: 'yahoo', yahooId: 'GC=F' },
      { id: 'XAGUSD', display: 'XAG/USD', name: 'Silver', source: 'yahoo', yahooId: 'SI=F' },
    ]
  }
};

export function getSymbolInfo(symbolId) {
  for (const category of Object.values(SYMBOL_CATEGORIES)) {
    const found = category.symbols.find(s => s.id === symbolId);
    if (found) return { ...found };
  }
  return null;
}

export const DEFAULT_SYMBOL = 'BTCUSDT';
