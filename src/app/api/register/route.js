import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Check for existing user
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error("DB lookup error:", dbErr.message);
      return NextResponse.json({ error: `Database error: ${dbErr.message}` }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          demoBalance: 1000.0,
          liveBalance: 0.0,
          accountType: 'DEMO',
          leverage: 100.0
        }
      });
    } catch (createErr) {
      console.error("DB create error:", createErr.message);
      return NextResponse.json({ error: `Account creation failed: ${createErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    return NextResponse.json({ error: `Registration failed: ${error.message}` }, { status: 500 });
  }
}
