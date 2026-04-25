"use client";
import React, { useEffect, useRef } from 'react';

export default function TradingViewChart() {
  const containerRef = useRef();

  useEffect(() => {
    // Prevent double injection in dev mode
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "BINANCE:BTCUSDT",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "hide_top_toolbar": false,
      "save_image": false,
      "container_id": "tradingview_advanced_chart"
    });
    
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="glass" style={{ 
      height: '600px', 
      width: '100%', 
      overflow: 'hidden', 
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      background: 'black'
    }}>
      <div id="tradingview_advanced_chart" ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
