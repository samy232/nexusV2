import { NextResponse } from 'next/server';
import { getSymbolInfo } from '@/lib/symbols';

async function fetchBinancePrice(symbolId) {
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbolId}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();
  return {
    price: parseFloat(data.lastPrice),
    change: parseFloat(data.priceChange),
    changePercent: parseFloat(data.priceChangePercent),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice),
    volume: parseFloat(data.quoteVolume),
  };
}

async function fetchYahooPrice(yahooId) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooId}?interval=1m&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 }
  });
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error('No data from Yahoo Finance');

  const meta = result.meta;
  const close = result.indicators.quote[0].close.filter(Boolean);
  const open = result.indicators.quote[0].open.filter(Boolean);
  const currentPrice = meta.regularMarketPrice || close[close.length - 1];
  const prevClose = meta.previousClose || meta.chartPreviousClose || open[0];
  const change = currentPrice - prevClose;
  const changePercent = (change / prevClose) * 100;

  return {
    price: currentPrice,
    change,
    changePercent,
    high: meta.regularMarketDayHigh || Math.max(...close),
    low: meta.regularMarketDayLow || Math.min(...close),
    volume: meta.regularMarketVolume || 0,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbolId = searchParams.get('symbol') || 'BTCUSDT';

  try {
    const info = getSymbolInfo(symbolId);
    if (!info) return NextResponse.json({ error: 'Unknown symbol' }, { status: 400 });

    let quote;
    if (info.source === 'binance') {
      quote = await fetchBinancePrice(symbolId);
    } else {
      quote = await fetchYahooPrice(info.yahooId);
    }

    return NextResponse.json({ symbol: symbolId, ...quote });
  } catch (error) {
    console.error('Price fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
