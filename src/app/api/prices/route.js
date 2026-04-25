import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated price data
  const data = {
    btc: { price: 42690.00, change24h: 2.45 },
    eth: { price: 2450.12, change24h: -1.2 },
    sol: { price: 145.67, change24h: 5.8 },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(data);
}
