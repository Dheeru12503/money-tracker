"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, UserRound, LoaderCircle } from "lucide-react";

type AdminUser = { _id: string; name: string; email: string; role: "USER" | "ADMIN"; active: boolean; createdAt: string };

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  useEffect(() => { fetch("/api/admin/summary", { cache: "no-store" }).then(async (response) => { if (response.ok) { const data = await response.json(); setUsers(data.userList || []); } setLoading(false); }); }, []);
  async function updateUser(user: AdminUser, field: "active" | "role") {
    setUpdating(user._id);
    const response = await fetch(`/api/admin/users/${user._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(field === "active" ? { active: !user.active } : { role: user.role === "ADMIN" ? "USER" : "ADMIN" }) });
    if (response.ok) { const updated = await response.json(); setUsers((current) => current.map((item) => item._id === user._id ? updated : item)); }
    setUpdating(null);
  }
  const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] p-4 pb-28 sm:p-7 sm:pb-24 xl:p-9"><header><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Access management</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Users</h1><p className="mt-1 text-sm text-slate-400">Manage real accounts registered in MongoDB.</p></header>
    <section className="mt-7 overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.05)]"><div className="border-b border-slate-100 p-4"><label className="flex max-w-md items-center gap-3 rounded-xl bg-slate-50 px-4"><Search size={18} className="shrink-0 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="w-full bg-transparent py-3 text-sm outline-none"/></label></div>
      {loading ? <div className="p-4 space-y-3">{[1,2,3].map((item)=><div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-50"/>)}</div> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((user)=><article key={user._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-5"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">{user.role === "ADMIN" ? <ShieldCheck size={21}/> : <UserRound size={21}/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-950">{user.name}</p><p className="mt-0.5 truncate text-xs text-slate-400">{user.email}</p><p className="mt-1 text-[10px] text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</p></div><div className="flex flex-wrap items-center gap-2">{updating === user._id ? <LoaderCircle size={20} className="animate-spin text-indigo-500"/> : null}<button onClick={() => updateUser(user,"role")} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">{user.role === "ADMIN" ? "Admin" : "User"}</button><button onClick={() => updateUser(user,"active")} className={`rounded-xl px-3 py-2 text-xs font-bold ${user.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{user.active ? "Active" : "Inactive"}</button></div></article>)}</div> : <div className="py-14 text-center"><UserRound className="mx-auto text-slate-300"/><p className="mt-3 text-sm text-slate-400">No matching users found.</p></div>}</section>
  </div>;
}
