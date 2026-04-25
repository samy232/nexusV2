import { NextResponse } from 'next/server';
import { getSymbolInfo } from '@/lib/symbols';

// Interval mapping for Yahoo Finance
const YAHOO_INTERVALS = {
  '1m': { interval: '1m', range: '1d' },
  '5m': { interval: '5m', range: '5d' },
  '15m': { interval: '15m', range: '5d' },
  '1h': { interval: '1h', range: '1mo' },
  '1d': { interval: '1d', range: '6mo' },
};

// Interval mapping for Binance
const BINANCE_INTERVALS = {
  '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '1d': '1d',
};

async function fetchBinanceHistory(symbolId, interval) {
  const binanceInterval = BINANCE_INTERVALS[interval] || '1m';
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbolId}&interval=${binanceInterval}&limit=500`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();
  // Binance: [openTime, open, high, low, close, volume, ...]
  return data.map(k => [k[0], parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4])]);
}

async function fetchYahooHistory(yahooId, interval) {
  const { interval: yInterval, range } = YAHOO_INTERVALS[interval] || YAHOO_INTERVALS['1m'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooId}?interval=${yInterval}&range=${range}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 }
  });
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error('No data from Yahoo Finance');

  const timestamps = result.timestamp;
  const { open, high, low, close } = result.indicators.quote[0];

  return timestamps.map((t, i) => [
    t * 1000, // Convert to ms
    open[i], high[i], low[i], close[i]
  ]).filter(k => k[1] != null); // Remove nulls
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbolId = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1m';

  try {
    const info = getSymbolInfo(symbolId);
    if (!info) {
      return NextResponse.json({ error: 'Unknown symbol' }, { status: 400 });
    }

    let history;
    if (info.source === 'binance') {
      history = await fetchBinanceHistory(symbolId, interval);
    } else {
      history = await fetchYahooHistory(info.yahooId, interval);
    }

    return NextResponse.json({ symbol: symbolId, interval, history });
  } catch (error) {
    console.error('History fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
