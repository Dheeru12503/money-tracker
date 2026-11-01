"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  IndianRupee,
  ReceiptText,
  TrendingUp,
  Users,
  ArrowUpRight,
} from "lucide-react";

type Summary = {
  users: number;
  activeUsers: number;
  transactionCount: number;
  today: number;
  month: number;
  thisWeek: number;
  lastWeek: number;
  recentExpenses: Array<{
    _id: string;
    amount: number;
    category: string;
    description?: string;
    date: string;
    user?: { name?: string };
  }>;
  topUsers: Array<{ name: string; amount: number }>;
  categoryTotals: Array<{ _id: string; amount: number }>;
  weeklyTotals: Array<{ _id: string; amount: number }>;
};
const money = (value = 0) => `₹${Number(value).toLocaleString("en-IN")}`;

export default function AdminOverview() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" }).then(
      async (response) => {
        if (response.ok) setData(await response.json());
        setLoading(false);
      },
    );
  }, []);
  if (loading)
    return (
      <div className="p-4 sm:p-8 xl:p-10">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-[24px] bg-white"
            />
          ))}
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        Unable to load platform data.
      </div>
    );
  const growth = data.lastWeek
    ? Math.round(((data.thisWeek - data.lastWeek) / data.lastWeek) * 100)
    : 0;
  const cards = [
    {
      label: "Registered users",
      value: data.users.toLocaleString("en-IN"),
      detail: `${data.activeUsers} active accounts`,
      icon: Users,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Spent today",
      value: money(data.today),
      detail: "Across all accounts",
      icon: IndianRupee,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Spent this month",
      value: money(data.month),
      detail: `${data.transactionCount} total entries`,
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "This week",
      value: money(data.thisWeek),
      detail: `${growth >= 0 ? "+" : ""}${growth}% from previous week`,
      icon: Activity,
      tone: "bg-orange-50 text-orange-600",
    },
  ];
  const maxCategory = Math.max(
    ...data.categoryTotals.map((item) => item.amount),
    1,
  );
  const maxWeek = Math.max(...data.weeklyTotals.map((item) => item.amount), 1);

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
          Platform control
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Live activity from all Paise Tracker accounts.
        </p>
      </header>
      <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article
            key={label}
            className="min-w-0 rounded-[24px] border border-white bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,.05)] sm:p-5"
          >
            <div
              className={`grid size-10 place-items-center rounded-2xl ${tone}`}
            >
              <Icon size={20} />
            </div>
            <p className="mt-4 truncate text-[11px] font-bold text-slate-400 sm:text-xs">
              {label}
            </p>
            <p className="mt-1 break-words text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {value}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-400 sm:text-xs">
              {detail}
            </p>
          </article>
        ))}
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <article className="overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.05)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-950">Recent transactions</h2>
              <p className="mt-1 text-xs text-slate-400">
                Latest activity across users
              </p>
            </div>
            <ReceiptText size={20} className="text-indigo-500" />
          </div>
          {data.recentExpenses.length ? (
            <div className="divide-y divide-slate-100">
              {data.recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center gap-3 px-4 py-4 sm:px-5"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {expense.description || expense.category}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {expense.user?.name || "Unknown user"} ·{" "}
                      {expense.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">
                      {money(expense.amount)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-slate-400">
              No expenses recorded yet.
            </p>
          )}
        </article>
        <article className="rounded-[26px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
          <h2 className="font-bold text-slate-950">Top spenders this month</h2>
          <p className="mt-1 text-xs text-slate-400">
            Based on recorded expenses
          </p>
          <div className="mt-5 space-y-4">
            {data.topUsers.length ? (
              data.topUsers.map((user, index) => (
                <div key={`${user.name}-${index}`}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <span className="truncate font-semibold text-slate-700">
                        {user.name || "Unknown user"}
                      </span>
                    </div>
                    <b className="shrink-0 text-slate-950">
                      {money(user.amount)}
                    </b>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{
                        width: `${data.topUsers[0]?.amount ? (user.amount / data.topUsers[0].amount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No spending this month.
              </p>
            )}
          </div>
        </article>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[26px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
          <h2 className="font-bold text-slate-950">Spending trend</h2>
          <div className="mt-6 flex h-44 items-end gap-2">
            {data.weeklyTotals.map((item) => (
              <div key={item._id} className="flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-indigo-100 hover:bg-indigo-500"
                  style={{
                    height: `${Math.max((item.amount / maxWeek) * 100, 5)}%`,
                  }}
                  title={`${item._id}: ${money(item.amount)}`}
                />
              </div>
            ))}
          </div>
          {!data.weeklyTotals.length && (
            <p className="py-8 text-center text-sm text-slate-400">
              No recent trend data.
            </p>
          )}
        </article>
        <article className="rounded-[26px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
          <h2 className="font-bold text-slate-950">Expense categories</h2>
          <div className="mt-5 space-y-3">
            {data.categoryTotals.slice(0, 6).map((item) => (
              <div key={item._id}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    {item._id || "Other"}
                  </span>
                  <b className="text-slate-950">{money(item.amount)}</b>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(item.amount / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {!data.categoryTotals.length && (
            <p className="py-8 text-center text-sm text-slate-400">
              No category data.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
