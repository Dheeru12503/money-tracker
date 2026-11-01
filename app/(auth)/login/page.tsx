"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    await fetch("/api/auth/remember", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ remember: rememberMe }) });
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.ok) {
      const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
      const session = sessionResponse.ok ? await sessionResponse.json() : null;
      const destination = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      router.replace(destination);
      router.refresh();
    }
    else { setError("Invalid email or password. Please try again."); setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
    <section className="relative hidden overflow-hidden bg-[#171827] lg:flex lg:flex-col lg:justify-between p-12 xl:p-16">
      <div className="absolute -left-24 top-32 size-80 rounded-full bg-indigo-500/20 blur-3xl"/><div className="absolute -right-28 bottom-0 size-96 rounded-full bg-violet-500/15 blur-3xl"/>
      <Link href="/" className="relative flex items-center gap-3 text-white"><div className="grid size-11 place-items-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950"><ShieldCheck size={23}/></div><div><p className="text-lg font-bold">Paise Tracker</p><p className="text-xs text-slate-400">Your money, clearly managed</p></div></Link>
      <div className="relative max-w-xl"><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-200"><TrendingUp size={14}/> Smarter spending starts here</p><h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">Build better habits with every rupee.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Track expenses, stay within your budget, and understand your financial patterns in one beautiful place.</p></div>
      <div className="relative grid grid-cols-2 gap-4"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur"><WalletCards className="text-indigo-300" size={21}/><p className="mt-4 text-sm font-bold text-white">Complete overview</p><p className="mt-1 text-xs leading-5 text-slate-400">Know exactly where every rupee goes.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur"><TrendingUp className="text-violet-300" size={21}/><p className="mt-4 text-sm font-bold text-white">Meaningful insights</p><p className="mt-1 text-xs leading-5 text-slate-400">Make decisions with clear analytics.</p></div></div>
    </section>

    <section className="min-h-screen bg-[#f7f8fc] px-0 py-0 md:bg-[#eef0f7] md:px-8 md:py-10 lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-md md:max-w-2xl md:overflow-hidden md:rounded-[28px] md:bg-white md:shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:max-w-md lg:overflow-visible lg:bg-transparent lg:shadow-none">
        <div className="relative overflow-hidden bg-[#171827] px-5 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:pb-9 md:pt-9 lg:hidden">
          <div className="absolute -right-20 -top-20 size-52 rounded-full bg-indigo-500/20 blur-3xl" />
          <Link href="/" className="relative flex items-center gap-3 text-white"><div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600"><ShieldCheck size={21}/></div><span className="font-bold">Paise Tracker</span></Link>
          <p className="relative mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">Welcome back</p>
          <h2 className="relative mt-2 max-w-sm text-2xl font-bold leading-tight text-white md:max-w-lg md:text-3xl">Your money, clearly managed.</h2>
          <p className="relative mt-2 text-xs leading-5 text-slate-400">Sign in to continue tracking every rupee.</p>
        </div>
        <div className="px-5 pb-8 pt-7 sm:px-7 md:px-10 md:pb-10 lg:p-0">
          <div className="hidden lg:block"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Welcome back</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to your account</h2><p className="mt-2 text-sm text-slate-400">Continue managing your money with confidence.</p></div>
      <form onSubmit={submit} className="mt-8">
        {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
        <label className="block text-xs font-bold text-slate-600">Email address<div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50"><Mail size={18} className="text-slate-400"/><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} placeholder="you@example.com" className="w-full bg-transparent py-3.5 pl-3 text-sm text-slate-900 outline-none placeholder:text-slate-300"/></div></label>
        <label className="mt-5 block text-xs font-bold text-slate-600">Password<div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50"><LockKeyhole size={18} className="text-slate-400"/><input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} placeholder="Enter your password" className="w-full bg-transparent py-3.5 pl-3 text-sm text-slate-900 outline-none placeholder:text-slate-300"/><button type="button" onClick={() => setShowPassword((show) => !show)} className="ml-2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
        <div className="mt-5 flex items-center justify-between gap-4 text-xs"><label className="flex cursor-pointer items-center gap-2 font-medium text-slate-500"><span className={`grid size-4 place-items-center rounded border transition ${rememberMe ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"}`}>{rememberMe && <Check size={12}/>}</span><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="sr-only"/>Remember me</label><button type="button" className="font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</button></div>
        <button disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-75">{loading && <LoaderCircle size={18} className="animate-spin"/>}{loading ? "Signing in..." : <>Sign in <ArrowRight size={17}/></>}</button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">New to Paise Tracker? <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">Create an account</Link></p>
        </div>
      </div>
    </section>
  </main>;
}
