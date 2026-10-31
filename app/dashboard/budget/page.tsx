"use client";

import { useEffect, useState } from "react";
import {
  Check,
  IndianRupee,
  LoaderCircle,
  PiggyBank,
  WalletCards,
} from "lucide-react";

export default function Budget() {
  const [amount, setAmount] = useState(0);
  const [spent, setSpent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/budgets"), fetch("/api/expenses")]).then(
      async ([budgetResponse, expenseResponse]) => {
        if (budgetResponse.ok)
          setAmount((await budgetResponse.json()).amount ?? 0);
        if (expenseResponse.ok) {
          const now = new Date();
          const expenses = await expenseResponse.json();
          setSpent(
            expenses
              .filter((expense: { date: string }) => {
                const date = new Date(expense.date);
                return (
                  date.getFullYear() === now.getFullYear() &&
                  date.getMonth() === now.getMonth()
                );
              })
              .reduce(
                (total: number, expense: { amount: number }) =>
                  total + expense.amount,
                0,
              ),
          );
        }
        setLoaded(true);
      },
    );
  }, []);

  async function saveBudget() {
    setSaving(true);
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setSaving(false);
    if (response.ok) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    }
  }

  const percentage = amount
    ? Math.min(Math.round((spent / amount) * 100), 100)
    : 0;
  const remaining = Math.max(amount - spent, 0);

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
          Plan your month
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Monthly budget
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Set a limit and stay in control of your spending.
        </p>
      </header>

      {!loaded ? (
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-[28px] bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-[28px] bg-[#171827] p-5 text-white shadow-[0_18px_50px_rgba(23,24,39,.18)] sm:p-7">
            <div className="absolute" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Spent this month
                </p>
                <p className="mt-2 text-3xl font-bold sm:text-4xl">
                  ₹{spent.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-indigo-300">
                <WalletCards size={22} />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              of ₹{amount.toLocaleString("en-IN")} monthly budget
            </p>
            <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between gap-4 text-xs">
              <span className="font-bold text-indigo-300">
                {percentage}% used
              </span>
              <span className="text-right font-medium text-slate-300">
                ₹{remaining.toLocaleString("en-IN")} remaining
              </span>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
              <div>
                <p className="text-[11px] text-slate-400">Total budget</p>
                <p className="mt-1 font-bold">
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-[11px] text-slate-400">Status</p>
                <p className="mt-1 font-bold text-emerald-300">
                  {amount
                    ? percentage >= 100
                      ? "Limit reached"
                      : "On track"
                    : "Not set"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-6">
            <div className="grid size-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <PiggyBank size={22} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Set monthly budget
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Choose an amount that feels realistic for the month.
            </p>
            <label className="mt-5 block text-xs font-bold text-slate-600">
              Monthly amount
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
              <IndianRupee size={19} className="shrink-0 text-slate-400" />
              <input
                aria-label="Monthly budget amount"
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="w-full bg-transparent px-3 py-3.5 text-lg font-bold text-slate-950 outline-none"
              />
            </div>
            <button
              onClick={saveBudget}
              disabled={saving}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-100 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" /> Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={18} /> Budget updated
                </>
              ) : (
                "Update budget"
              )}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
