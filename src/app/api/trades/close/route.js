import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tradeId, exitPrice } = await req.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the trade
      const trade = await tx.trade.findUnique({
        where: { id: tradeId }
      });

      if (!trade || trade.userId !== session.user.id || trade.status !== 'OPEN') {
        throw new Error('Invalid trade or already closed');
      }

      // 2. Calculate PnL
      const pnl = (exitPrice - trade.price) * trade.amount;
      
      // 3. Update trade
      await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: 'CLOSED',
          exitPrice,
          pnl,
        }
      });

      // 4. Return initial capital + profit to user balance
      // Initial capital was: trade.total (already subtracted from balance)
      // Amount to return: trade.total + pnl
      const amountToReturn = trade.total + pnl;

      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: amountToReturn } }
      });

      return { trade, newBalance: user.balance, pnl };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
