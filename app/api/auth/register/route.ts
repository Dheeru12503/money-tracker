import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password || password.length < 8) {
      return NextResponse.json({ error: "Enter a valid name, email, and a password with at least 8 characters" }, { status: 400 });
    }
    await connectDB();
    if (await User.findOne({ email: normalizedEmail })) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: "USER" });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    if (error?.message?.includes("authentication failed")) {
      return NextResponse.json({ error: "Database authentication is not configured correctly" }, { status: 503 });
    }
    return NextResponse.json({ error: "Unable to create account right now" }, { status: 500 });
  }
}
