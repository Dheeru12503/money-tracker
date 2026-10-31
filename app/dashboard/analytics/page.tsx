"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  IndianRupee,
  PieChart,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Expense {
  amount: number;
  category: string;
  date: string;
}
type Period = "7" | "30" | "month";
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const colors = [
  "#6366f1",
  "#a78bfa",
  "#38bdf8",
  "#fb7185",
  "#34d399",
  "#fbbf24",
];

export default function Analytics() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<Period>("7");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setCurrentDate(new Date());
      const response = await fetch("/api/expenses");
      if (response.ok) setExpenses(await response.json());
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => {
    if (!currentDate)
      return {
        total: 0,
        average: 0,
        highestCategory: "—",
        count: 0,
        days: [] as { name: string; amount: number }[],
        categories: [] as {
          name: string;
          amount: number;
          percentage: number;
        }[],
      };
    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    if (period === "month") start.setDate(1);
    else start.setDate(start.getDate() - Number(period) + 1);
    const dayCount =
      period === "month" ? currentDate.getDate() : Number(period);
    const filtered = expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date >= start && date <= end;
    });
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryMap = filtered.reduce<Record<string, number>>(
      (result, expense) => {
        result[expense.category] =
          (result[expense.category] ?? 0) + expense.amount;
        return result;
      },
      {},
    );
    const categories = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    const days = Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return {
        name:
          dayCount > 14
            ? date.toLocaleDateString("en-IN", { day: "numeric" })
            : date.toLocaleDateString("en-IN", { weekday: "short" }),
        amount: filtered
          .filter((expense) => {
            const spent = new Date(expense.date);
            return spent >= date && spent <= dayEnd;
          })
          .reduce((sum, expense) => sum + expense.amount, 0),
      };
    });
    return {
      total,
      average: total / dayCount,
      highestCategory: categories[0]?.name ?? "—",
      count: filtered.length,
      days,
      categories,
    };
  }, [expenses, currentDate, period]);

  const periodLabel =
    period === "7" ? "7 days" : period === "30" ? "30 days" : "this month";
  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
            Financial insights
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Understand where your money goes.
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm sm:flex">
          <CalendarDays size={17} className="text-slate-400" />
          <select
            aria-label="Analytics period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="min-w-0 w-full border-0 bg-transparent py-3 text-sm font-semibold text-slate-600 outline-none sm:w-auto sm:border sm:rounded-xl sm:border-slate-200 sm:px-4"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="month">This month</option>
          </select>
        </div>
      </header>
      {loading ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-[24px] bg-white"
            />
          ))}
          <div className="h-96 animate-pulse rounded-[26px] bg-white xl:col-span-3" />
          <div className="h-96 animate-pulse rounded-[26px] bg-white" />
        </div>
      ) : (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title={`Spent · ${periodLabel}`}
              value={currency.format(analytics.total)}
              icon={<IndianRupee size={20} />}
              accent="bg-indigo-50 text-indigo-600"
            />
            <Metric
              title="Daily average"
              value={currency.format(analytics.average)}
              icon={<BarChart3 size={20} />}
              accent="bg-blue-50 text-blue-600"
            />
            <Metric
              title="Top category"
              value={analytics.highestCategory}
              icon={<PieChart size={20} />}
              accent="bg-violet-50 text-violet-600"
            />
            <Metric
              title="Transactions"
              value={String(analytics.count)}
              icon={<TrendingUp size={20} />}
              accent="bg-emerald-50 text-emerald-600"
            />
          </section>
          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-[26px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Daily spending
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Spending pattern for the selected period
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  LIVE
                </span>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.days}
                    margin={{ top: 10, right: 0, bottom: 0, left: -22 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0" stopColor="#6366f1" />
                        <stop offset="1" stopColor="#a78bfa" />
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
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(value) => currency.format(Number(value))}
                      contentStyle={{
                        border: "none",
                        borderRadius: 14,
                        boxShadow: "0 12px 30px rgba(15,23,42,.12)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#barGradient)"
                      radius={[7, 7, 2, 2]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[26px] border border-white bg-[#171827] p-6 text-white shadow-[0_18px_50px_rgba(23,24,39,.18)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Category split</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Where your money went
                  </p>
                </div>
                <WalletCards size={20} className="text-indigo-300" />
              </div>
              {analytics.categories.length === 0 ? (
                <div className="grid h-72 place-items-center text-center">
                  <p className="text-sm text-slate-400">
                    No spending in this period.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-7 flex justify-center">
                    <div
                      className="grid size-36 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(${analytics.categories.map((item, index) => `${colors[index % colors.length]} ${index === 0 ? 0 : analytics.categories.slice(0, index).reduce((sum, value) => sum + value.percentage, 0)}% ${analytics.categories.slice(0, index + 1).reduce((sum, value) => sum + value.percentage, 0)}%`).join(",")})`,
                      }}
                    >
                      <div className="grid size-[104px] place-items-center rounded-full bg-[#171827] text-center">
                        <div>
                          <p className="text-lg font-bold">
                            {currency.format(analytics.total)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            total spent
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-7 space-y-3">
                    {analytics.categories.slice(0, 5).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: colors[index % colors.length] }}
                        />
                        <span className="flex-1 text-xs text-slate-300">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}{" "}
            </div>
          </section>
          <section className="mt-5 overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-950">Spending trend</h2>
              <p className="mt-1 text-xs text-slate-400">
                Cumulative view of your selected period
              </p>
            </div>
            <div className="h-72 p-4 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.days}
                  margin={{ left: -18, right: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="analyticsArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="1" stopColor="#6366f1" stopOpacity={0} />
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
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#analyticsArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.055)]">
      <div className={`grid size-10 place-items-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <p className="mt-5 text-xs font-medium text-slate-400">{title}</p>
      <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
