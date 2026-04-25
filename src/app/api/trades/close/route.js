import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { tradeId, exitPrice } = await req.json();

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { user: true }
    });

    if (!trade || trade.status === 'CLOSED') {
      return NextResponse.json({ error: 'Trade not found or already closed' }, { status: 404 });
    }

    const pnl = trade.type === 'BUY' 
      ? (exitPrice - trade.price) * trade.amount 
      : (trade.price - exitPrice) * trade.amount;

    // Determine which balance to update
    const balanceField = trade.accountType === 'DEMO' ? 'demoBalance' : 'liveBalance';
    const currentBalance = trade.accountType === 'DEMO' ? trade.user.demoBalance : trade.user.liveBalance;

    // Use a transaction to ensure both updates happen correctly
    const result = await prisma.$transaction([
      prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: 'CLOSED',
          exitPrice: parseFloat(exitPrice),
          pnl: pnl
        }
      }),
      prisma.user.update({
        where: { id: trade.userId },
        data: {
          [balanceField]: currentBalance + pnl
        }
      })
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Close trade error:", error);
    return NextResponse.json({ error: 'Failed to close trade' }, { status: 500 });
  }
}
