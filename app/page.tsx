"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Expense = {
  id: number;
  created_at: string;
  date: string;
  amount: number;
  description: string;
};

export default function Home() {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !amount || !description.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        date,
        amount: Number(amount),
        description: description.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setExpenses((prev) => [data, ...prev]);
      setAmount("");
      setDescription("");
    }
    setSaving(false);
  };

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("ko-KR").format(value);

  const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${year}년 ${month}월 ${day}일`;
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const labelClass =
    "text-sm font-medium text-zinc-500 sm:text-xs sm:uppercase sm:tracking-wider";
  const inputClass =
    "w-full rounded-lg bg-zinc-100/80 px-5 py-4 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-300 sm:px-4 sm:py-3.5 sm:text-base";

  return (
    <div className="min-h-full w-full bg-zinc-50">
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 py-12 sm:px-8 sm:py-20">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            나의 스마트 가계부
          </h1>
          <p className="mt-3 text-base text-zinc-500 sm:text-lg">
            오늘의 지출을 기록해 보세요
          </p>
        </header>

        <section className="w-full rounded-2xl bg-white p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-2">
              <label htmlFor="date" className={labelClass}>
                날짜
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-3 sm:gap-2">
              <label htmlFor="amount" className={labelClass}>
                금액
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-mono text-base text-zinc-400 sm:left-4 sm:text-sm">
                  ₩
                </span>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  className={`${inputClass} pl-10 font-mono tabular-nums sm:pl-8`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-2">
              <label htmlFor="description" className={labelClass}>
                내용
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 점심 식사, 교통비"
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 min-h-14 w-full rounded-lg bg-blue-600 py-4 text-lg font-medium text-white transition hover:bg-blue-700 disabled:opacity-40 sm:mt-0 sm:min-h-12 sm:py-3.5 sm:text-base"
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </form>
        </section>

        <section className="mt-16 w-full sm:mt-20">
          <div className="mb-8 flex items-end justify-between sm:mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 sm:text-base">
              지출 내역
            </h2>
            {!loading && expenses.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-zinc-400">총 지출</p>
                <p className="font-mono text-xl font-semibold tabular-nums tracking-tight text-blue-600 sm:text-lg">
                  {formatAmount(total)}원
                </p>
              </div>
            )}
          </div>

          {loading ? (
            <p className="py-12 text-center text-base text-zinc-400 sm:text-sm">
              불러오는 중...
            </p>
          ) : expenses.length === 0 ? (
            <p className="py-12 text-center text-base text-zinc-400 sm:text-sm">
              아직 기록된 지출이 없습니다.
            </p>
          ) : (
            <ul className="flex w-full flex-col gap-3">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl bg-white px-5 py-5 sm:px-6 sm:py-4"
                >
                  <div className="min-w-0 flex-1 pr-6">
                    <p className="truncate text-lg font-medium text-zinc-900 sm:text-base">
                      {expense.description}
                    </p>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-lg">
                    {formatAmount(expense.amount)}
                    <span className="ml-0.5 text-sm font-normal text-zinc-400">
                      원
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
