"use client";

import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Plus,
  Search,
  TrainFront,
  Utensils,
  ShoppingBag,
  Bus,
  ArrowUpRight,
  WalletCards,
  ReceiptText,
  Sparkles,
  X,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
const categoryIcons: Record<string, typeof TrainFront> = {
  Metro: TrainFront,
  Transport: Bus,
  Food: Utensils,
  Shopping: ShoppingBag,
  Bus,
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const openExpense = () => setOpen(true);
    window.addEventListener("open-add-expense", openExpense);
    return () => window.removeEventListener("open-add-expense", openExpense);
  }, []);

  async function loadData() {
    setLoading(true);
    const [expenseResponse, budgetResponse] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/budgets"),
    ]);
    if (expenseResponse.ok) setExpenses(await expenseResponse.json());
    if (budgetResponse.ok) setBudget((await budgetResponse.json()).amount ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentDate(new Date());
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    if (!currentDate) return { today: 0, week: 0, month: 0 };
    const todayStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6);
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const totalAfter = (start: Date) =>
      expenses
        .filter((item) => new Date(item.date) >= start)
        .reduce((sum, item) => sum + item.amount, 0);
    return {
      today: totalAfter(todayStart),
      week: totalAfter(weekStart),
      month: totalAfter(monthStart),
    };
  }, [expenses, currentDate]);

  const chart = useMemo(() => {
    if (!currentDate) return [];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      return {
        name: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        amount: expenses
          .filter((item) => {
            const day = new Date(item.date);
            return day >= date && day < end;
          })
          .reduce((sum, item) => sum + item.amount, 0),
      };
    });
  }, [expenses, currentDate]);

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
      setError(
        "Could not save the expense. Please check the values and try again.",
      );
    else {
      setOpen(false);
      await loadData();
    }
    setSaving(false);
  }

  const remaining = Math.max(budget - totals.month, 0);
  const used = budget
    ? Math.min(Math.round((totals.month / budget) * 100), 100)
    : 0;
  const firstName = session?.user?.name?.trim().split(" ")[0] || "there";
  const greeting =
    currentDate && currentDate.getHours() < 12
      ? "Good morning"
      : currentDate && currentDate.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
            {currentDate?.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {greeting}, {firstName}{" "}
            <span className="inline-block origin-bottom-right animate-[wave_1.5s_ease-in-out_infinite]">
              👋
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-400 shadow-sm sm:flex">
            <Search size={17} />
            Search
            <span className="ml-3 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px]">
              ⌘K
            </span>
          </button>
          <button
            className="relative hidden size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm sm:grid"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-rose-500" />
          </button>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="grid size-11 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-200"
              aria-label="Open user profile"
              aria-expanded={profileOpen}
            >
              {firstName[0]?.toUpperCase()}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,.18)]">
                <div className="px-3 py-3">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {session?.user?.name || "My account"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {session?.user?.email || "Personal account"}
                  </p>
                </div>
                <div className="h-px bg-slate-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 active:bg-red-50"
                >
                  <LogOut size={18} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-3xl bg-white/70"
            />
          ))}
          <div className="h-80 animate-pulse rounded-3xl bg-white sm:col-span-2 xl:col-span-3" />
          <div className="h-80 animate-pulse rounded-3xl bg-white" />
        </div>
      ) : (
        <>
          <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Spent today"
              value={currency.format(totals.today)}
              note="Today"
              icon={<ReceiptText size={20} />}
              accent="bg-indigo-50 text-indigo-600"
            />
            <SummaryCard
              label="Last 7 days"
              value={currency.format(totals.week)}
              note="Weekly spending"
              icon={<ArrowUpRight size={20} />}
              accent="bg-violet-50 text-violet-600"
            />
            <SummaryCard
              label="This month"
              value={currency.format(totals.month)}
              note="Monthly spending"
              icon={<CalendarDays size={20} />}
              accent="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              label="Budget left"
              value={currency.format(remaining)}
              note={budget ? `${used}% of budget used` : "Set a monthly budget"}
              icon={<WalletCards size={20} />}
              accent="bg-emerald-50 text-emerald-600"
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-950">
                      Spending overview
                    </h2>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    How your spending moved this week
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                  <CalendarDays size={15} /> Last 7 days
                </div>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chart}
                    margin={{ top: 10, right: 5, bottom: 0, left: -18 }}
                  >
                    <defs>
                      <linearGradient
                        id="dashboardFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#eef0f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      formatter={(value) => currency.format(Number(value))}
                      contentStyle={{
                        borderRadius: 14,
                        border: "none",
                        boxShadow: "0 12px 30px rgba(15,23,42,.12)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={3.5}
                      fill="url(#dashboardFill)"
                      activeDot={{
                        r: 6,
                        fill: "#6366f1",
                        stroke: "white",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] bg-[#171827] p-6 text-white shadow-[0_18px_50px_rgba(23,24,39,.18)]">
              <div className="absolute -right-16 -top-16 size-52 rounded-full bg-violet-500/20 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Monthly budget
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {currency.format(totals.month)}
                    </p>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <WalletCards size={20} />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  of {currency.format(budget)}
                </p>
                <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all"
                    style={{ width: `${used}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>{used}% used</span>
                  <span>{currency.format(remaining)} left</span>
                </div>
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.06] p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Smart reminder</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {budget
                          ? "Keep an eye on your weekly pace."
                          : "Add a budget to track your progress."}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  <Plus size={18} /> Add expense
                </button>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent transactions
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Your latest activity
                </p>
              </div>
              <a
                href="/dashboard/expenses"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
              >
                View all <ChevronRight size={15} />
              </a>
            </div>
            {expenses.length === 0 ? (
              <div className="grid place-items-center px-6 py-14 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <ReceiptText size={24} />
                </div>
                <h3 className="mt-4 font-bold">No expenses yet</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add your first expense to start seeing insights.
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Add expense
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 px-5 sm:px-6">
                {expenses.slice(0, 5).map((expense) => {
                  const Icon = categoryIcons[expense.category] ?? ShoppingBag;
                  return (
                    <div
                      key={expense._id}
                      className="flex items-center gap-3 py-4"
                    >
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {expense.description || expense.category}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {expense.category} · {expense.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {currency.format(expense.amount)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

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
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-6 text-white">
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
                  className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
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
                <Field label="Amount" wide>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
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
                </Field>
                <Field label="Category">
                  <select name="category" disabled={saving} className="input">
                    <option>Metro</option>
                    <option>Food</option>
                    <option>Shopping</option>
                    <option>Bus</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Transaction date">
                  <input
                    name="date"
                    required
                    type="date"
                    defaultValue={currentDate?.toISOString().slice(0, 10) ?? ""}
                    disabled={saving}
                    className="input"
                  />
                </Field>
                <Field label="Payment method" wide>
                  <select
                    name="paymentMethod"
                    disabled={saving}
                    className="input"
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Description" wide>
                  <textarea
                    name="description"
                    rows={3}
                    disabled={saving}
                    className="input resize-none"
                    placeholder="Add a note about this expense"
                  />
                </Field>
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

function SummaryCard({
  label,
  value,
  note,
  icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="min-w-0 rounded-[20px] border border-white bg-white p-3.5 shadow-[0_8px_28px_rgba(15,23,42,.055)] sm:rounded-[24px] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`grid size-9 place-items-center rounded-xl sm:size-10 ${accent}`}
        >
          {icon}
        </div>
        <span className="hidden rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:inline">
          {label === "Budget left" ? "BALANCE" : "TOTAL"}
        </span>
      </div>
      <p className="mt-3 truncate text-[11px] font-semibold text-slate-400 sm:mt-5 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-[26px]">
        {value}
      </p>
      <p className="mt-1.5 truncate text-[10px] font-medium text-slate-400 sm:mt-2 sm:text-[11px]">
        {note}
      </p>
    </div>
  );
}
function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label
      className={`block text-xs font-bold text-slate-600 ${wide ? "sm:col-span-2" : ""}`}
    >
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
