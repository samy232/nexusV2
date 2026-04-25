"use client";
import { useState, useEffect, useRef } from 'react';
import { getSymbolInfo } from '@/lib/symbols';

export function usePriceFeed(symbolId, interval = '1m') {
  const [price, setPrice] = useState(0);
  const [history, setHistory] = useState([]);
  const [quote, setQuote] = useState({});
  const wsRef = useRef(null);
  const symbolInfo = getSymbolInfo(symbolId);

  // Fetch OHLC History from our unified API
  useEffect(() => {
    if (!symbolId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/market/history?symbol=${symbolId}&interval=${interval}`);
        const data = await res.json();
        if (data.history) setHistory(data.history);
      } catch (e) {
        console.error('History fetch failed:', e);
      }
    };
    fetchHistory();
  }, [symbolId, interval]);

  // Live price streaming
  useEffect(() => {
    if (!symbolId || !symbolInfo) return;

    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (symbolInfo.source === 'binance') {
      // CRYPTO: Use Binance WebSocket for real-time ticks
      const streamSymbol = symbolId.toLowerCase();
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@kline_${interval}`);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const kline = msg.k;
        setPrice(parseFloat(kline.c));
        setHistory(prev => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          const klineTime = kline.t;
          const updated = [...prev];
          if (last[0] === klineTime) {
            updated[updated.length - 1] = [klineTime, parseFloat(kline.o), parseFloat(kline.h), parseFloat(kline.l), parseFloat(kline.c)];
          } else {
            updated.push([klineTime, parseFloat(kline.o), parseFloat(kline.h), parseFloat(kline.l), parseFloat(kline.c)]);
          }
          return updated;
        });
      };

      ws.onerror = (e) => console.error('WS error:', e);
      wsRef.current = ws;

    } else {
      // FOREX/METALS: Poll our price API every 2 seconds
      const fetchPrice = async () => {
        try {
          const res = await fetch(`/api/market/price?symbol=${symbolId}`);
          const data = await res.json();
          if (data.price) {
            setPrice(data.price);
            setQuote(data);
            // Update last candle in history
            setHistory(prev => {
              if (!prev.length) return prev;
              const now = Date.now();
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = [last[0], last[1], Math.max(last[2], data.price), Math.min(last[3], data.price), data.price];
              return updated;
            });
          }
        } catch (e) {}
      };

      fetchPrice();
      const interval_id = setInterval(fetchPrice, 2000);
      return () => clearInterval(interval_id);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbolId, interval]);

  return { price, history, quote };
}
