import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 6);
  thisWeekStart.setHours(0, 0, 0, 0);

  const [users, activeUsers, totals, recentExpenses, topUsers, categoryTotals, weeklyTotals] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ active: true }),
    Expense.aggregate([
      { $group: { _id: null, all: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.find().populate("user", "name email").sort({ date: -1 }).limit(8).lean(),
    Expense.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: "$user", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, userId: "$_id", name: "$user.name", email: "$user.email", amount: 1, count: 1 } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: lastWeekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "Asia/Kolkata" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const [today, month, thisWeek, lastWeek, userList, allExpenses] = await Promise.all([
    Expense.aggregate([{ $match: { date: { $gte: todayStart } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    Expense.aggregate([{ $match: { date: { $gte: monthStart } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    Expense.aggregate([{ $match: { date: { $gte: thisWeekStart } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    Expense.aggregate([{ $match: { date: { $gte: lastWeekStart, $lt: thisWeekStart } } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    User.find().select("name email role active createdAt").sort({ createdAt: -1 }).lean(),
    Expense.find().populate("user", "name email").sort({ date: -1 }).limit(100).lean(),
  ]);

  const indiaFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const indiaParts = (date: Date) => indiaFormatter.formatToParts(date).reduce<Record<string, string>>((parts, part) => {
    if (part.type !== "literal") parts[part.type] = part.value;
    return parts;
  }, {});
  const todayParts = indiaParts(now);
  const todayKey = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
  const todayStartUtc = new Date(`${todayKey}T00:00:00.000Z`);
  const dailyTotals = new Map(weeklyTotals.map((item: { _id: string; amount: number }) => [item._id, item.amount]));
  const filledDailyTotals = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(todayStartUtc);
    day.setUTCDate(todayStartUtc.getUTCDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    return { _id: key, amount: dailyTotals.get(key) ?? 0 };
  });

  return NextResponse.json({
    users,
    activeUsers,
    totalExpenses: totals[0]?.all ?? 0,
    transactionCount: totals[0]?.count ?? 0,
    today: today[0]?.amount ?? 0,
    month: month[0]?.amount ?? 0,
    thisWeek: thisWeek[0]?.amount ?? 0,
    lastWeek: lastWeek[0]?.amount ?? 0,
    userList,
    recentExpenses,
    allExpenses,
    topUsers,
    categoryTotals,
    weeklyTotals: filledDailyTotals,
  });
}
