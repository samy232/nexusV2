"use client";
import { useState, useEffect } from 'react';

export function usePriceFeed(symbol = 'BTCUSDT', interval = '1m') {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [history, setHistory] = useState([]); // Will store OHLC data: [timestamp, open, high, low, close]

  useEffect(() => {
    // 1. Fetch initial OHLC history (klines)
    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`);
        const data = await res.json();
        const formatted = data.map(d => [
          d[0], // Timestamp
          parseFloat(d[1]), // Open
          parseFloat(d[2]), // High
          parseFloat(d[3]), // Low
          parseFloat(d[4])  // Close
        ]);
        setHistory(formatted);
        if (formatted.length > 0) setPrice(formatted[formatted.length - 1][4]);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchHistory();

    // 2. Setup WebSocket for live updates
    const wsSymbol = symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${interval}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k; // Kline data
      
      const newPrice = parseFloat(k.c);
      setPrice(newPrice);
      
      // Update history with the latest kline (real-time candle formation)
      setHistory(prev => {
        const last = prev[prev.length - 1];
        const current = [k.t, parseFloat(k.o), parseFloat(k.h), parseFloat(k.l), parseFloat(k.c)];
        
        if (last && last[0] === k.t) {
          // Update current candle
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = current;
          return newHistory;
        } else {
          // New candle started
          return [...prev, current].slice(-200);
        }
      });
    };

    return () => ws.close();
  }, [symbol, interval]);

  return { price, change, history };
}
