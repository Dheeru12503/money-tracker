import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const loans = await Loan.find({ user: session.user.id }).sort({ settled: 1, dueDate: 1, createdAt: -1 }).lean();
  return NextResponse.json(loans);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const data = await request.json();
  if (!data.person || !data.amount || !["borrowed", "lent"].includes(data.type)) {
    return NextResponse.json({ error: "Person, amount and type are required" }, { status: 400 });
  }
  const loan = await Loan.create({
    ...data,
    user: session.user.id,
    amount: Number(data.amount),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });
  return NextResponse.json(loan, { status: 201 });
}
