import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    // 1. Fetch user to know active account type
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, accountType: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Fetch trades FILTERED by userId, status, AND accountType
    const trades = await prisma.trade.findMany({
      where: {
        userId: user.id,
        status: status || undefined,
        accountType: user.accountType // ISOLATION FIX
      },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error("Fetch trades error:", error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { symbol, type, amount, price } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Open trade with the user's current account type
    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        symbol,
        type,
        amount: parseFloat(amount),
        price: parseFloat(price),
        total: parseFloat(amount) * parseFloat(price),
        accountType: user.accountType // ISOLATION FIX
      }
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Open trade error:", error);
    return NextResponse.json({ error: 'Failed to open trade' }, { status: 500 });
  }
}
