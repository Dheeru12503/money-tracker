import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";

export async function GET() {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const month = new Date().toISOString().slice(0, 7);
  const budget = await Budget.findOne({ user: session.user.id, month });
  return NextResponse.json({ amount: budget?.amount ?? 0 });
}
export async function POST(request: Request) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const { amount } = await request.json();
  const month = new Date().toISOString().slice(0, 7);
  const budget = await Budget.findOneAndUpdate({ user: session.user.id, month }, { amount }, { upsert: true, new: true });
  return NextResponse.json(budget);
}
