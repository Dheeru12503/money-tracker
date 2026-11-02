import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import mongoose from "mongoose";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const { id } = await params; const data = await request.json();
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
  const amount = Number(data.amount);
  const date = new Date(data.date);
  if (!Number.isFinite(amount) || amount <= 0 || !data.category || !data.paymentMethod || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid expense data" }, { status: 400 });
  }
  const update = {
    amount,
    category: data.category,
    description: data.description,
    date: new Date(data.date),
    paymentMethod: data.paymentMethod,
  };
  const expense = await Expense.findOneAndUpdate(
    { _id: id, user: session.user.id },
    update,
    { new: true, runValidators: true },
  );
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 }); return NextResponse.json(expense);
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB(); const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
  const expense = await Expense.findOneAndDelete({ _id: id, user: session.user.id });
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 }); return NextResponse.json({ success: true });
}
