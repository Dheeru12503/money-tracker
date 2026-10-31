import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      await connectDB();
      const email = String(credentials.email ?? "").trim().toLowerCase();
      const password = String(credentials.password ?? "");
      if (!email || !password) return null;
      const user = await User.findOne({ email });
      if (!user?.active || !user.password) return null;
      if (!(await bcrypt.compare(password, user.password))) return null;
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    },
  })],
});
