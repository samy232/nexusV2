"use client";
import { useState, useEffect } from 'react';

export function usePriceFeed(symbol = 'btcusdt') {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.c)); // Current price
      setChange(parseFloat(data.P)); // 24h price change percentage
    };

    return () => ws.close();
  }, [symbol]);

  return { price, change };
}
