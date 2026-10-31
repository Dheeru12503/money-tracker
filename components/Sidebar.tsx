"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ReceiptText,
  ChartNoAxesCombined,
  WalletCards,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  Users,
  Settings,
  Plus,
  Ellipsis,
  Home,
  UserRound,
  HandCoins,
} from "lucide-react";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptText },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartNoAxesCombined,
  },
  { label: "Budget", href: "/dashboard/budget", icon: WalletCards },
  { label: "Borrow & lend", href: "/dashboard/loans", icon: HandCoins },
];

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Expenses", href: "/admin/expenses", icon: ReceiptText },
  { label: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);
  const navigation = admin ? adminLinks : links;

  function openAddExpense() {
    setMoreOpen(false);
    if (pathname === "/dashboard" || pathname === "/dashboard/expenses") {
      window.dispatchEvent(new CustomEvent("open-add-expense"));
      return;
    }
    router.push("/dashboard/expenses");
    window.setTimeout(
      () => window.dispatchEvent(new CustomEvent("open-add-expense")),
      400,
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/70 bg-white/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={23} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              Paise
            </p>
            <p className="text-xs font-medium text-slate-400">Tracker</p>
          </div>
        </Link>
        <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
          Workspace
        </div>
        <nav className="mt-3 space-y-1.5">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon size={19} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto overflow-hidden rounded-[22px] bg-[#171827] p-4 text-white shadow-xl shadow-slate-200">
          <div className="grid size-9 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
            <ArrowUpRight size={18} />
          </div>
          <p className="mt-4 text-sm font-bold">Better money habits</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Keep tracking your expenses and watch your savings grow.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} /> Log out
        </button>
      </aside>

      <nav className="fixed bottom-[calc(.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 grid grid-cols-5 items-end rounded-[24px] border border-white/90 bg-white/95 px-2 pb-2 pt-1.5 shadow-[0_16px_45px_rgba(15,23,42,.22)] backdrop-blur-xl lg:hidden">
        <NavItem
          href={admin ? "/admin" : "/dashboard"}
          active={pathname === (admin ? "/admin" : "/dashboard")}
          icon={Home}
          label={admin ? "Admin" : "Overview"}
        />
        <NavItem
          href={admin ? "/admin/analytics" : "/dashboard/analytics"}
          active={pathname.includes("analytics")}
          icon={ChartNoAxesCombined}
          label="Analytics"
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openAddExpense}
            className="-mt-7 grid size-[56px] shrink-0 place-items-center rounded-full border-[5px] border-[#f7f8fc] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_10px_28px_rgba(79,70,229,.38)] transition-transform active:scale-[0.96]"
            aria-label="Add expense"
          >
            <Plus size={27} strokeWidth={2.5} />
          </button>
        </div>
        <NavItem
          href={admin ? "/admin/settings" : "/dashboard/budget"}
          active={pathname.includes(admin ? "settings" : "budget")}
          icon={admin ? Settings : WalletCards}
          label={admin ? "Settings" : "Budget"}
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            className={`flex h-[48px] w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-semibold ${moreOpen ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}
          >
            <Ellipsis size={20} />
            <span>More</span>
            <span
              className={`mt-0.5 h-1 w-1 rounded-full bg-indigo-500 transition-opacity ${moreOpen ? "opacity-100" : "opacity-0"}`}
            />
          </button>
          {moreOpen && (
            <div className="absolute bottom-14 right-0 w-64 rounded-2xl border border-slate-200/70 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,.18)]">
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                  <UserRound size={19} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {session?.user?.name || "My account"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {session?.user?.email || "Personal account"}
                  </p>
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              {!admin && (
                <>
                  <Link
                    href="/dashboard/expenses"
                    onClick={() => setMoreOpen(false)}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 active:bg-indigo-50"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ReceiptText size={18} />
                    </span>
                    Expense history
                  </Link>
                  <Link
                    href="/dashboard/loans"
                    onClick={() => setMoreOpen(false)}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 active:bg-indigo-50"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <HandCoins size={18} />
                    </span>
                    Borrow & lend
                  </Link>
                  <button
                    type="button"
                    onClick={openAddExpense}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-indigo-600 active:bg-indigo-50"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-indigo-50">
                      <Plus size={18} />
                    </span>
                    Add expense
                  </button>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 active:bg-red-50"
              >
                <LogOut size={18} /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

function NavItem({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[48px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-semibold ${active ? "text-indigo-600" : "text-slate-400"}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span className="max-w-full truncate">{label}</span>
      <span
        className={`mt-0.5 h-1 w-1 rounded-full bg-indigo-500 transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
      />
    </Link>
  );
}
