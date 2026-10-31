import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";

export async function GET() {
  const session = await auth(); if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB(); const start = new Date(); start.setHours(0,0,0,0);
  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const [today, month] = await Promise.all([
    Expense.aggregate([{ $match: { date: { $gte: start } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    Expense.aggregate([{ $match: { date: { $gte: monthStart } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
  ]);
  return NextResponse.json({ users: await User.countDocuments(), activeUsers: await User.countDocuments({ active: true }), today: today[0]?.amount ?? 0, month: month[0]?.amount ?? 0 });
}
