import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { remember } = await request.json().catch(() => ({ remember: false }));
  const response = NextResponse.json({ remember: Boolean(remember) });
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };

  if (remember) {
    response.cookies.set("paise.remember-me", "1", { ...cookie, maxAge: 30 * 24 * 60 * 60 });
  } else {
    response.cookies.delete("paise.remember-me");
  }
  return response;
}
