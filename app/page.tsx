import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: "USER" | "ADMIN" }).role;
    redirect(role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Paise Tracker</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Every rupee, accounted for.</h1>
        <p className="mx-auto mt-5 max-w-lg text-slate-400">Track expenses, manage budgets, and understand your spending.</p>
        <Link href="/login" className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold">Open Paise Tracker</Link>
      </div>
    </main>
  );
}
