import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        demoBalance: true, 
        liveBalance: true, 
        accountType: true, 
        leverage: true,
        name: true,
        email: true
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, value } = await req.json();
    const userEmail = session.user.email;

    let updateData = {};

    if (action === "SWITCH_ACCOUNT") {
      updateData.accountType = value; // "DEMO" or "LIVE"
    } else if (action === "RESET_DEMO") {
      updateData.demoBalance = 1000.0;
    } else if (action === "UPDATE_DEMO_BALANCE") {
      updateData.demoBalance = parseFloat(value);
    } else if (action === "UPDATE_LEVERAGE") {
      updateData.leverage = parseFloat(value);
    }

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: updateData
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
