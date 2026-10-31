"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  LoaderCircle,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Trash2,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod: string;
}
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const categoryStyle: Record<
  string,
  { icon: typeof ReceiptText; color: string; bg: string }
> = {
  Food: { icon: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
  Shopping: { icon: ShoppingBag, color: "text-pink-600", bg: "bg-pink-50" },
  Travel: { icon: WalletCards, color: "text-violet-600", bg: "bg-violet-50" },
  Metro: { icon: WalletCards, color: "text-violet-600", bg: "bg-violet-50" },
  Bus: { icon: WalletCards, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadExpenses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "All") params.set("category", category);
    const response = await fetch(
      `/api/expenses${params.size ? `?${params}` : ""}`,
    );
    if (response.ok) setExpenses(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    const openExpense = () => setOpen(true);
    window.addEventListener("open-add-expense", openExpense);
    return () => window.removeEventListener("open-add-expense", openExpense);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const response = await fetch("/api/expenses");
      if (response.ok) setExpenses(await response.json());
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function removeExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (response.ok)
        setExpenses((current) =>
          current.filter((expense) => expense._id !== id),
        );
    } finally {
      setDeletingId(null);
    }
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(form.get("amount")),
        category: form.get("category"),
        date: form.get("date"),
        paymentMethod: form.get("paymentMethod"),
        description: form.get("description") || form.get("category"),
      }),
    });
    if (!response.ok)
      setError("Could not save this expense. Please try again.");
    else {
      setOpen(false);
      await loadExpenses();
    }
    setSaving(false);
  }

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(expenses.map((expense) => expense.category))),
    ],
    [expenses],
  );

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
            Money activity
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Expense history
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review, search, and manage every transaction.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="hidden items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 sm:flex"
        >
          <Plus size={18} /> Add expense
        </button>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-indigo-100">
              Filtered spending
            </p>
            <ReceiptText size={19} />
          </div>
          <p className="mt-4 text-3xl font-bold">{currency.format(total)}</p>
          <p className="mt-2 text-xs text-indigo-100">
            Across {expenses.length} transactions
          </p>
        </div>
        <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.055)]">
          <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarDays size={20} />
          </div>
          <p className="mt-4 text-xs text-slate-400">Latest transaction</p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {expenses[0]
              ? new Date(expenses[0].date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                })
              : "—"}
          </p>
        </div>
        <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.055)]">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <CreditCard size={20} />
          </div>
          <p className="mt-4 text-xs text-slate-400">Top category</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">
            {[...expenses].sort((a, b) => b.amount - a.amount)[0]?.category ||
              "—"}
          </p>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 text-slate-400">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadExpenses();
              }}
              placeholder="Search description or category..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
            }}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400 sm:w-auto"
          >
            <option>All</option>
            {categories
              .filter((item) => item !== "All")
              .map((item) => (
                <option key={item}>{item}</option>
              ))}
          </select>
          <button
            onClick={() => void loadExpenses()}
            className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white sm:min-h-0"
          >
            Apply
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-2xl bg-slate-50"
                />
              ))}{" "}
            </div>
          ) : expenses.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ReceiptText size={24} />
              </div>
              <h2 className="mt-4 font-bold text-slate-900">
                No expenses found
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or add a new transaction.
              </p>
            </div>
          ) : (
            <>
              <table className="hidden w-full text-left md:table">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    <th className="px-5 py-4 font-bold sm:px-6">Transaction</th>
                    <th className="px-4 py-4 font-bold">Date</th>
                    <th className="px-4 py-4 font-bold">Payment</th>
                    <th className="px-5 py-4 text-right font-bold sm:px-6">
                      Amount
                    </th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => {
                    const style = categoryStyle[expense.category] ?? {
                      icon: ReceiptText,
                      color: "text-indigo-600",
                      bg: "bg-indigo-50",
                    };
                    const Icon = style.icon;
                    return (
                      <tr
                        key={expense._id}
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`grid size-11 shrink-0 place-items-center rounded-2xl ${style.bg} ${style.color}`}
                            >
                              <Icon size={19} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {expense.description || expense.category}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {expense.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-slate-950 sm:px-6">
                          {currency.format(expense.amount)}
                        </td>
                        <td className="px-3 py-4">
                          <button
                            disabled={deletingId === expense._id}
                            onClick={() => void removeExpense(expense._id)}
                            className="grid size-9 place-items-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 disabled:cursor-wait disabled:bg-red-50"
                            aria-label={`Delete ${expense.category} expense`}
                          >
                            {deletingId === expense._id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin text-red-500"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="divide-y divide-slate-100 md:hidden">
                {expenses.map((expense) => {
                  const style = categoryStyle[expense.category] ?? {
                    icon: ReceiptText,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  };
                  const Icon = style.icon;
                  return (
                    <article key={expense._id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${style.bg} ${style.color}`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {expense.description || expense.category}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {expense.category} · {expense.paymentMethod}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {new Date(expense.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-bold text-slate-950">
                            {currency.format(expense.amount)}
                          </p>
                          <button
                            disabled={deletingId === expense._id}
                            onClick={() => void removeExpense(expense._id)}
                            className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-500 disabled:cursor-wait"
                            aria-label={`Delete ${expense.category} expense`}
                          >
                            {deletingId === expense._id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[70] grid place-items-end overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={addExpense}
            className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,.28)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-5 text-white sm:px-6 sm:py-6">
              <div className="absolute -right-12 -top-16 size-40 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-white/15">
                    <ReceiptText size={22} />
                  </div>
                  <h2 className="text-xl font-bold">Add a new expense</h2>
                  <p className="mt-1 text-sm text-indigo-100">
                    Record where your money went.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-7">
              {error && (
                <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Amount
                  <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                    <span className="font-bold text-slate-400">₹</span>
                    <input
                      name="amount"
                      required
                      min="0.01"
                      step="0.01"
                      type="number"
                      disabled={saving}
                      className="w-full bg-transparent py-3.5 pl-3 text-lg font-bold text-slate-900 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Category
                  <select
                    name="category"
                    disabled={saving}
                    className="input mt-2"
                  >
                    <option>Food</option>
                    <option>Shopping</option>
                    <option>Metro</option>
                    <option>Bus</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Transaction date
                  <input
                    name="date"
                    required
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    disabled={saving}
                    className="input mt-2"
                  />
                </label>
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Payment method
                  <select
                    name="paymentMethod"
                    disabled={saving}
                    className="input mt-2"
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    disabled={saving}
                    className="input mt-2 resize-none"
                    placeholder="What did you spend on?"
                  />
                </label>
              </div>
              <div className="mt-7 grid grid-cols-[auto_1fr] gap-3 sm:flex">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:cursor-wait disabled:opacity-75"
                >
                  {saving && (
                    <LoaderCircle size={18} className="animate-spin" />
                  )}
                  {saving ? "Saving expense..." : "Save expense"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
