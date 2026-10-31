import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = request.nextUrl;
  const filter: any = { user: session.user.id };
  if (searchParams.get("category")) filter.category = searchParams.get("category")!;
  if (searchParams.get("search")) filter.description = { $regex: searchParams.get("search"), $options: "i" };
  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
  return NextResponse.json(expenses);
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const data = await request.json();
  const expense = await Expense.create({ ...data, user: session.user.id, date: new Date(data.date) });
  return NextResponse.json(expense, { status: 201 });
}
