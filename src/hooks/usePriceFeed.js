"use client";
import { useState, useEffect } from 'react';

export function usePriceFeed(symbol = 'BTCUSDT') {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 1. Fetch initial history (1h candles)
    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
        const data = await res.json();
        const formatted = data.map(d => ({
          time: d[0] / 1000,
          value: parseFloat(d[4]) // Close price
        }));
        setHistory(formatted);
        if (formatted.length > 0) setPrice(formatted[formatted.length - 1].value);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchHistory();

    // 2. Setup WebSocket for live updates
    const wsSymbol = symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.c));
      setChange(parseFloat(data.P));
    };

    return () => ws.close();
  }, [symbol]);

  return { price, change, history };
}
