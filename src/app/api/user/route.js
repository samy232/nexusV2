import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        demoBalance: true, 
        liveBalance: true, 
        accountType: true,
        leverage: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the balance based on active account type
    const activeBalance = user.accountType === "DEMO" ? user.demoBalance : user.liveBalance;

    return NextResponse.json({
      balance: activeBalance,
      accountType: user.accountType,
      leverage: user.leverage,
      demoBalance: user.demoBalance,
      liveBalance: user.liveBalance
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
