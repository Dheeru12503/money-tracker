import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const updates: { active?: boolean; role?: "USER" | "ADMIN" } = {};
  if (typeof body.active === "boolean") updates.active = body.active;
  if (body.role === "USER" || body.role === "ADMIN") updates.role = body.role;
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("name email role active createdAt");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}
