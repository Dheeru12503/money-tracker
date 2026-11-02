import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.isValidObjectId(session.user.id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 401 });
  }
  await connectDB();
  const { searchParams } = request.nextUrl;
  const filter: Record<string, unknown> = {
    user: new mongoose.Types.ObjectId(session.user.id),
  };
  const category = searchParams.get("category");
  if (category && category !== "All") filter.category = category;
  if (searchParams.get("search")) {
    const search = searchParams.get("search")!.trim();
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { description: { $regex: escapedSearch, $options: "i" } },
      { category: { $regex: escapedSearch, $options: "i" } },
    ];
    const numericSearch = Number(search.replace(/,/g, ""));
    if (Number.isFinite(numericSearch) && search !== "") {
      (filter.$or as object[]).push({ amount: numericSearch });
    }
  }
  const date = searchParams.get("date");
  if (date) {
    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (
      !year ||
      !month ||
      !day ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const dayStart = new Date(Date.UTC(year, month - 1, day) - 330 * 60_000);
    const nextDay = new Date(dayStart);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    filter.date = { $gte: dayStart, $lt: nextDay };
  }

  const expensesQuery = Expense.find(filter).sort({ date: -1, _id: -1 });
  if (searchParams.get("paginate") !== "true") {
    return NextResponse.json(await expensesQuery.lean());
  }

  const pageSize = 8;
  const requestedPage = Number(searchParams.get("page")) || 1;
  const total = await Expense.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const expenses = await expensesQuery.skip((page - 1) * pageSize).limit(pageSize).lean();
  const spending = await Expense.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return NextResponse.json({
    expenses,
    page,
    pages,
    total,
    filteredTotal: spending[0]?.total ?? 0,
  });
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const data = await request.json();
  const amount = Number(data.amount);
  const date = new Date(data.date);
  if (!Number.isFinite(amount) || amount <= 0 || !data.category || !data.paymentMethod || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid expense data" }, { status: 400 });
  }
  const expense = await Expense.create({ ...data, user: session.user.id, date: new Date(data.date) });
  return NextResponse.json(expense, { status: 201 });
}
