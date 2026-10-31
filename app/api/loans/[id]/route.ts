import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const { settled } = await request.json();
  const loan = await Loan.findOneAndUpdate({ _id: id, user: session.user.id }, { settled: Boolean(settled) }, { new: true });
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  return NextResponse.json(loan);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const loan = await Loan.findOneAndDelete({ _id: id, user: session.user.id });
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
