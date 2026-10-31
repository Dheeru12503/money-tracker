import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const { id } = await params; const data = await request.json();
  const expense = await Expense.findOneAndUpdate({ _id: id, user: session.user.id }, { ...data, date: new Date(data.date) }, { new: true });
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 }); return NextResponse.json(expense);
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const { id } = await params;
  const expense = await Expense.findOneAndDelete({ _id: id, user: session.user.id });
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 }); return NextResponse.json({ success: true });
}
