"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  IndianRupee,
  LoaderCircle,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Loan = {
  _id: string;
  type: "borrowed" | "lent";
  person: string;
  amount: number;
  dueDate?: string;
  note?: string;
  settled: boolean;
};

const emptyForm = { type: "lent" as "borrowed" | "lent", person: "", amount: "", dueDate: "", note: "" };

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "lent" | "borrowed">("all");
  const [form, setForm] = useState(emptyForm);

  async function loadLoans() {
    const response = await fetch("/api/loans", { cache: "no-store" });
    if (response.ok) setLoans(await response.json());
    setLoading(false);
  }

  useEffect(() => { loadLoans(); }, []);

  async function addLoan(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) { toast.error("Could not save this entry"); return; }
    toast.success("Money record added");
    setDialogOpen(false);
    setForm(emptyForm);
    loadLoans();
  }

  async function updateLoan(loan: Loan) {
    setActionId(loan._id);
    await fetch(`/api/loans/${loan._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settled: !loan.settled }),
    });
    setActionId(null);
    loadLoans();
  }

  async function deleteLoan(loan: Loan) {
    setActionId(loan._id);
    const response = await fetch(`/api/loans/${loan._id}`, { method: "DELETE" });
    setActionId(null);
    if (response.ok) { toast.success("Record removed"); loadLoans(); }
  }

  const pending = loans.filter((loan) => !loan.settled);
  const toReceive = pending.filter((loan) => loan.type === "lent").reduce((sum, loan) => sum + loan.amount, 0);
  const toPay = pending.filter((loan) => loan.type === "borrowed").reduce((sum, loan) => sum + loan.amount, 0);
  const visibleLoans = loans.filter((loan) => filter === "all" || loan.type === filter);

  function money(value: number) { return `₹${value.toLocaleString("en-IN")}`; }
  function dueLabel(value?: string) {
    if (!value) return "No due date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No due date";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Money relationships</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Borrow & lend</h1>
          <p className="mt-1 text-sm text-slate-400">Know exactly who you owe and who owes you.</p>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="hidden min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 sm:flex">
          <Plus size={18} /> Add record
        </button>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-[26px] bg-[#171827] p-5 text-white shadow-[0_18px_50px_rgba(23,24,39,.16)]">
          <div className="absolute -right-8 -top-8 size-28 rounded-full bg-emerald-400/10" />
          <div className="relative flex items-start justify-between">
            <div><p className="text-xs font-medium text-slate-400">To receive</p><p className="mt-2 text-3xl font-bold">{money(toReceive)}</p><p className="mt-1 text-xs text-slate-400">Money lent to others</p></div>
            <div className="grid size-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300"><ArrowDownLeft size={22} /></div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[26px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-medium text-slate-400">To repay</p><p className="mt-2 text-3xl font-bold text-slate-950">{money(toPay)}</p><p className="mt-1 text-xs text-slate-400">Money borrowed by you</p></div>
            <div className="grid size-11 place-items-center rounded-2xl bg-orange-50 text-orange-500"><ArrowUpRight size={22} /></div>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.05)]">
        <div className="flex gap-2 border-b border-slate-100 p-3">
          {(["all", "lent", "borrowed"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${filter === item ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"}`}>
              {item === "lent" ? "Money lent" : item === "borrowed" ? "Money borrowed" : "All records"}
            </button>
          ))}
        </div>
        {loading ? <div className="p-5 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div> : visibleLoans.length === 0 ? (
          <div className="px-5 py-14 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-indigo-50 text-indigo-500"><UserRound size={24} /></div><h2 className="mt-4 font-bold text-slate-950">No records yet</h2><p className="mt-1 text-sm text-slate-400">Add money you borrowed or lent.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleLoans.map((loan) => (
              <article key={loan._id} className={`flex items-center gap-3 p-4 transition-opacity ${loan.settled ? "opacity-55" : ""}`}>
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${loan.type === "lent" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}>
                  {loan.type === "lent" ? <ArrowDownLeft size={21} /> : <ArrowUpRight size={21} />}
                </div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-950">{loan.person}</p><p className="mt-0.5 text-xs text-slate-400">{loan.type === "lent" ? "Should return you" : "You need to repay"} · {dueLabel(loan.dueDate)}</p>{loan.note && <p className="mt-1 truncate text-xs text-slate-400">{loan.note}</p>}</div>
                <div className="text-right"><p className={`font-bold ${loan.type === "lent" ? "text-emerald-600" : "text-orange-500"}`}>{money(loan.amount)}</p>{loan.settled && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-500">Settled</span>}</div>
                <div className="flex shrink-0 items-center gap-1">
                  <button title={loan.settled ? "Mark pending" : "Mark settled"} disabled={actionId === loan._id} onClick={() => updateLoan(loan)} className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600">{actionId === loan._id ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={17} />}</button>
                  <button title="Delete" disabled={actionId === loan._id} onClick={() => deleteLoan(loan)} className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500"><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <button type="button" onClick={() => setDialogOpen(true)} className="fixed bottom-[88px] right-4 z-40 grid size-14 place-items-center rounded-full bg-indigo-600 text-white shadow-[0_12px_30px_rgba(79,70,229,.35)] sm:hidden" aria-label="Add money record"><Plus size={25} /></button>

      {dialogOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
          <form onSubmit={addLoan} className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[28px]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-500">New record</p><h2 className="mt-1 text-xl font-bold text-slate-950">Add money</h2></div><button type="button" onClick={() => setDialogOpen(false)} className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500"><X size={19} /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button type="button" onClick={() => setForm({ ...form, type: "lent" })} className={`rounded-xl py-3 text-xs font-bold ${form.type === "lent" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}><ArrowDownLeft className="mx-auto mb-1" size={19} />Money lent</button>
              <button type="button" onClick={() => setForm({ ...form, type: "borrowed" })} className={`rounded-xl py-3 text-xs font-bold ${form.type === "borrowed" ? "bg-white text-orange-500 shadow-sm" : "text-slate-400"}`}><ArrowUpRight className="mx-auto mb-1" size={19} />Money borrowed</button>
            </div>
            <label className="mt-5 block text-xs font-bold text-slate-600">Person name</label><input required value={form.person} onChange={(event) => setForm({ ...form, person: event.target.value })} placeholder="e.g. Rahul" className="input mt-2" />
            <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3"><div><label className="block text-xs font-bold text-slate-600">Amount</label><div className="input mt-2 flex items-center gap-2"><IndianRupee size={17} className="text-slate-400" /><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="min-w-0 w-full bg-transparent outline-none" /></div></div><div><label className="block text-xs font-bold text-slate-600">Due date</label><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="input mt-2" /></div></div>
            <label className="mt-4 block text-xs font-bold text-slate-600">Note <span className="font-normal text-slate-400">(optional)</span></label><textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Reason or reminder" className="input mt-2 min-h-20 resize-none" />
            <button disabled={saving} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-70">{saving ? <><LoaderCircle size={18} className="animate-spin" />Saving...</> : <><Plus size={18} />Add record</>}</button>
          </form>
        </div>
      )}
    </div>
  );
}
