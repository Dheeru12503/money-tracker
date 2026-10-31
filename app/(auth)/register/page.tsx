"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound, WalletCards } from "lucide-react";

type FormDataState = { name: string; email: string; password: string; confirm: string };

export default function Register() {
  const [form, setForm] = useState<FormDataState>({ name: "", email: "", password: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (form.password !== form.confirm) { setMessage("Passwords do not match."); setSuccess(false); return; }
    setLoading(true);
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({ error: "Unable to create account" })) as { error?: string };
    if (response.ok) { setSuccess(true); setMessage("Your account has been created successfully."); setForm({ name: "", email: "", password: "", confirm: "" }); }
    else { setSuccess(false); setMessage(data.error || "Unable to create account."); }
    setLoading(false);
  }

  const passwordLengthValid = form.password.length >= 8;
  return <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
    <section className="relative hidden overflow-hidden bg-[#171827] lg:flex lg:flex-col lg:justify-between p-12 xl:p-16">
      <div className="absolute -left-24 top-32 size-80 rounded-full bg-indigo-500/20 blur-3xl"/><div className="absolute -right-28 bottom-0 size-96 rounded-full bg-violet-500/15 blur-3xl"/>
      <Link href="/" className="relative flex items-center gap-3 text-white"><div className="grid size-11 place-items-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950"><ShieldCheck size={23}/></div><div><p className="text-lg font-bold">Paise Tracker</p><p className="text-xs text-slate-400">Your money, clearly managed</p></div></Link>
      <div className="relative max-w-xl"><div className="mb-5 grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-indigo-300"><WalletCards size={26}/></div><h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">Take control of your financial story.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Create your account and start building healthy spending habits today.</p></div>
      <div className="relative space-y-3"><Feature text="Track every expense in one place"/><Feature text="Plan monthly budgets with confidence"/><Feature text="Discover clear spending insights"/></div>
    </section>

    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-md">
      <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden"><div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white"><ShieldCheck size={21}/></div><span className="font-bold text-slate-950">Paise Tracker</span></Link>
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Get started</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create your account</h1><p className="mt-2 text-sm text-slate-400">It only takes a minute to begin.</p></div>
      <form onSubmit={submit} className="mt-7">
        {message && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${success ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-600"}`}>{message}{success && <Link href="/login" className="ml-1 font-bold underline">Sign in now</Link>}</div>}
        <AuthField label="Full name" icon={<UserRound size={18}/>}><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} disabled={loading} autoComplete="name" placeholder="Your full name"/></AuthField>
        <div className="mt-4"><AuthField label="Email address" icon={<Mail size={18}/>}><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} disabled={loading} autoComplete="email" placeholder="you@example.com"/></AuthField></div>
        <div className="mt-4"><AuthField label="Password" icon={<LockKeyhole size={18}/>}><input required minLength={8} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} disabled={loading} autoComplete="new-password" placeholder="At least 8 characters"/><button type="button" onClick={() => setShowPassword((show) => !show)} className="text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></AuthField></div>
        <div className="mt-4"><AuthField label="Confirm password" icon={<LockKeyhole size={18}/>}><input required minLength={8} type={showPassword ? "text" : "password"} value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} disabled={loading} autoComplete="new-password" placeholder="Repeat your password"/></AuthField></div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><span className={`grid size-4 place-items-center rounded-full ${passwordLengthValid ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>{passwordLengthValid && <Check size={11}/>}</span>Use at least 8 characters</div>
        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-75">{loading && <LoaderCircle size={18} className="animate-spin"/>}{loading ? "Creating account..." : <>Create account <ArrowRight size={17}/></>}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</Link></p>
    </div></section>
  </main>;
}

function Feature({ text }: { text: string }) { return <div className="flex items-center gap-3 text-sm text-slate-300"><span className="grid size-6 place-items-center rounded-full bg-indigo-500/20 text-indigo-300"><Check size={14}/></span>{text}</div>; }
function AuthField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <label className="block text-xs font-bold text-slate-600">{label}<div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">{icon}<div className="flex min-w-0 flex-1 items-center [&>input]:w-full [&>input]:bg-transparent [&>input]:py-3.5 [&>input]:pl-3 [&>input]:text-sm [&>input]:text-slate-900 [&>input]:outline-none [&>input]:placeholder:text-slate-300">{children}</div></div></label>; }
