import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { symbol, type, amount, price } = await req.json();

  if (!symbol || !type || !amount || !price) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const total = amount * price;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get user and check balance
      const user = await tx.user.findUnique({
        where: { id: session.user.id }
      });

      if (type === 'BUY' && user.balance < total) {
        throw new Error('Insufficient balance');
      }

      // 2. Create trade
      const trade = await tx.trade.create({
        data: {
          userId: session.user.id,
          symbol,
          type,
          amount,
          price,
          total
        }
      });

      // 3. Update balance
      const newBalance = type === 'BUY' 
        ? user.balance - total 
        : user.balance + total;

      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance }
      });

      return { trade, newBalance };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: 'desc' },
    take: 20
  });

  return NextResponse.json(trades);
}
