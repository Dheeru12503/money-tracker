"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LoaderCircle,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  SlidersHorizontal,
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
  createdAt?: string;
}
function toLocalDateTimeInput(value?: string) {
  const date = value ? new Date(value) : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
function transactionDate(expense: Expense) {
  const date = new Date(expense.date);
  if (
    expense.createdAt &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0
  ) {
    return new Date(expense.createdAt);
  }
  return date;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [transactionCount, setTransactionCount] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDate, setMobileDate] = useState("");
  const [mobileCategory, setMobileCategory] = useState("All");
  const [paging, setPaging] = useState(false);
  const [pageDirection, setPageDirection] = useState<"next" | "previous">("next");

  async function loadExpenses(
    targetPage = page,
    selectedDate = dateFilter,
    selectedCategory = category,
  ) {
    const pageChange = targetPage !== page;
    if (pageChange) setPaging(true);
    else setLoading(true);
    setLoadError("");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedDate) params.set("date", selectedDate);
    params.set("paginate", "true");
    params.set("page", String(targetPage));
    try {
      const response = await fetch(
        `/api/expenses${params.size ? `?${params}` : ""}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Could not load expenses");
      const data = await response.json();
      setExpenses(data.expenses);
      setPage(data.page);
      setPages(data.pages);
      setTransactionCount(data.total);
      setFilteredTotal(data.filteredTotal);
    } catch {
      setLoadError("Could not apply these filters. Please try again.");
    } finally {
      setPaging(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    const openExpense = () => {
      setEditingId(null);
      setError("");
      setOpen(true);
    };
    window.addEventListener("open-add-expense", openExpense);
    return () => window.removeEventListener("open-add-expense", openExpense);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const response = await fetch("/api/expenses?paginate=true&page=1");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setPage(data.page);
        setPages(data.pages);
        setTransactionCount(data.total);
        setFilteredTotal(data.filteredTotal);
      }
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function removeExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (response.ok) {
        setExpenses((current) =>
          current.filter((expense) => expense._id !== id),
        );
        await loadExpenses(page);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(
      editingId ? `/api/expenses/${editingId}` : "/api/expenses",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.get("amount")),
          category: form.get("category"),
          date: new Date(String(form.get("date"))).toISOString(),
          paymentMethod: form.get("paymentMethod"),
          description: form.get("description") || form.get("category"),
        }),
      },
    );
    if (!response.ok)
      setError("Could not save this expense. Please try again.");
    else {
      setOpen(false);
      setEditingId(null);
      await loadExpenses();
    }
    setSaving(false);
  }

  function openAddExpense() {
    setEditingId(null);
    setError("");
    setOpen(true);
  }

  function editExpense(expense: Expense) {
    setEditingId(expense._id);
    setError("");
    setOpen(true);
  }

  function closeExpenseForm() {
    if (saving) return;
    setOpen(false);
    setEditingId(null);
    setError("");
  }

  function applyFilters(nextPage = 1) {
    setPageDirection(nextPage > page ? "next" : "previous");
    setPage(nextPage);
    void loadExpenses(nextPage);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setDateFilter("");
    setPage(1);
    setMobileDate("");
    setMobileCategory("All");
    window.setTimeout(() => {
      const params = new URLSearchParams({ paginate: "true", page: "1" });
      void fetch(`/api/expenses?${params}`).then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setExpenses(data.expenses);
        setPage(data.page);
        setPages(data.pages);
        setTransactionCount(data.total);
        setFilteredTotal(data.filteredTotal);
      });
    }, 0);
  }

  function applyMobileFilters() {
    setDateFilter(mobileDate);
    setCategory(mobileCategory);
    setPage(1);
    setMobileFiltersOpen(false);
    void loadExpenses(1, mobileDate, mobileCategory);
  }

  const editingExpense = expenses.find((expense) => expense._id === editingId);

  const categories = useMemo(
    () =>
      Array.from(
        new Set([
          "All",
          "Food",
          "Shopping",
          "Travel",
          "Metro",
          "Bus",
          "Other",
          ...expenses.map((expense) => expense.category),
        ]),
      ),
    [expenses],
  );

  return (
    <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9">
      {loadError && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {loadError}
        </div>
      )}
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
          onClick={openAddExpense}
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
          <p className="mt-4 text-3xl font-bold">{currency.format(filteredTotal)}</p>
          <p className="mt-2 text-xs text-indigo-100">
            Across {transactionCount} matching transactions
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

      <section className="mt-5 rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
        <div className="sticky top-0 z-30 rounded-t-[26px] border-b border-slate-100 bg-white/95 p-4 backdrop-blur-xl sm:p-5">
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileDate(dateFilter);
                setMobileCategory(category);
                setMobileFiltersOpen(true);
              }}
              className="flex min-h-11 w-full items-center justify-between rounded-xl bg-white text-slate-800"
            >
              <span className="text-base font-bold text-indigo-950">
                Recent transactions
              </span>
              {(dateFilter || category !== "All") && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] text-indigo-600">
                  {[dateFilter ? 1 : 0, category !== "All" ? 1 : 0].reduce((a, b) => a + b, 0)} active
                </span>
              )}
              <span className="ml-auto grid size-9 place-items-center rounded-lg text-slate-500">
                <SlidersHorizontal size={19} />
              </span>
            </button>
          </div>
          <div className="hidden space-y-3 md:block">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-slate-100/80 px-4 text-slate-400 ring-1 ring-inset ring-transparent focus-within:bg-white focus-within:ring-indigo-200">
                <Search size={19} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyFilters();
                  }}
                  placeholder="Search description, category or amount"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                      void loadExpenses(1, dateFilter, category);
                    }}
                    className="grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-slate-400">
                <CalendarDays size={17} />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => {
                    const selectedDate = event.target.value;
                    setDateFilter(selectedDate);
                    setPage(1);
                    void loadExpenses(1, selectedDate);
                  }}
                  className="min-w-0 bg-transparent text-sm font-medium text-slate-600 outline-none"
                  aria-label="Filter by transaction date"
                />
              </label>
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-12 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Clear all
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setPage(1);
                    void loadExpenses(1, dateFilter, item);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    category === item
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/30 md:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
            />
            <div className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="mx-auto mt-3 mb-5 h-1 w-10 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-950">Filter transactions</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mt-5 flex min-h-12 items-center gap-3 rounded-xl bg-slate-100 px-4 text-slate-400">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search description, category or amount"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="mt-6 border-b border-slate-100 pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Transaction date</p>
                  <button
                    type="button"
                    onClick={() => setMobileDate("")}
                    className="text-xs font-bold text-indigo-600"
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="date"
                  value={mobileDate}
                  onChange={(event) => setMobileDate(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="py-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Category</p>
                  <button
                    type="button"
                    onClick={() => setMobileCategory("All")}
                    className="text-xs font-bold text-indigo-600"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMobileCategory(item)}
                      className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${
                        mobileCategory === item
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDate("");
                    setMobileCategory("All");
                    setDateFilter("");
                    setCategory("All");
                    setPage(1);
                    setMobileFiltersOpen(false);
                    void loadExpenses(1, "", "All");
                  }}
                  className="min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
                >
                  Reset all
                </button>
                <button
                  type="button"
                  onClick={applyMobileFilters}
                  className="min-h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-100"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          {loading && !paging ? (
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
              <div key={page} className={pageDirection === "next" ? "expense-page-next" : "expense-page-previous"}>
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
                          {transactionDate(expense).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {transactionDate(expense).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => editExpense(expense)}
                              className="grid size-9 place-items-center rounded-xl text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"
                              aria-label={`Edit ${expense.category} expense`}
                            >
                              <Pencil size={17} />
                            </button>
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
                          </div>
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
                            {transactionDate(expense).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            {" · "}
                            {transactionDate(expense).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-bold text-slate-950">
                            {currency.format(expense.amount)}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => editExpense(expense)}
                              className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"
                              aria-label={`Edit ${expense.category} expense`}
                            >
                              <Pencil size={17} />
                            </button>
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
                      </div>
                    </article>
                  );
                })}
              </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6">
          <p className="hidden text-xs text-slate-400 sm:block">
            Showing {expenses.length ? (page - 1) * 8 + 1 : 0}-{Math.min(page * 8, transactionCount)} of {transactionCount} transactions
          </p>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <button
              type="button"
              disabled={page <= 1 || loading || paging}
              onClick={() => applyFilters(page - 1)}
              aria-label="Previous page"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-40 sm:flex sm:w-auto sm:gap-1 sm:rounded-xl sm:px-3"
            >
              <ChevronLeft size={19} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="flex min-w-24 items-center justify-center gap-1.5 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
              <span className="text-indigo-600">{page}</span>
              <span className="text-slate-300">/</span>
              <span>{pages}</span>
            </span>
            <button
              type="button"
              disabled={page >= pages || loading || paging}
              onClick={() => applyFilters(page + 1)}
              aria-label="Next page"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none sm:flex sm:w-auto sm:gap-1 sm:rounded-xl sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={19} />
            </button>
          </div>
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
                  <h2 className="text-xl font-bold">
                    {editingExpense ? "Edit expense" : "Add a new expense"}
                  </h2>
                  <p className="mt-1 text-sm text-indigo-100">
                    {editingExpense
                      ? "Update this transaction."
                      : "Record where your money went."}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeExpenseForm}
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
                      defaultValue={editingExpense?.amount}
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
                    defaultValue={editingExpense?.category}
                    disabled={saving}
                    className="input mt-2"
                  >
                    <option>Food</option>
                    <option>Shopping</option>
                    <option>Metro</option>
                    <option>Bus</option>
                    <option>Travel</option>
                    <option>Other</option>
                    {editingExpense &&
                      !["Food", "Shopping", "Metro", "Bus", "Travel", "Other"].includes(
                        editingExpense.category,
                      ) && <option>{editingExpense.category}</option>}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Transaction date
                  <input
                    name="date"
                    required
                    type="date"
                    defaultValue={
                      editingExpense
                        ? toLocalDateTimeInput(transactionDate(editingExpense).toISOString())
                        : toLocalDateTimeInput()
                    }
                    disabled={saving}
                    className="input mt-2"
                  />
                </label>
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Payment method
                  <select
                    name="paymentMethod"
                    defaultValue={editingExpense?.paymentMethod}
                    disabled={saving}
                    className="input mt-2"
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingExpense?.description ?? ""}
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
                  onClick={closeExpenseForm}
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
                  {saving
                    ? "Saving expense..."
                    : editingExpense
                      ? "Update expense"
                      : "Save expense"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
