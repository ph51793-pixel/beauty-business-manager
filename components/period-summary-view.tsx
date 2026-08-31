"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Receipt, ChevronDown } from "lucide-react"
import { StatCard, MiniStat } from "./stat-card"
import { RevenueChart } from "./revenue-chart"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  PAYMENT_METHOD_LABELS,
  EXPENSE_CATEGORY_LABELS,
  type PaymentMethod,
  type ExpenseCategory,
} from "@/lib/constants"
import type { Period, PeriodFinancials } from "@/lib/data/finance"

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
]

export type PeriodComparison = {
  previousLabel: string
  revenueChangePct: number | null
} | null

export function PeriodSummaryView({
  period,
  label,
  from,
  to,
  current,
  comparison,
}: {
  period: Period
  label: string
  from: string
  to: string
  current: PeriodFinancials
  comparison: PeriodComparison
}) {
  const router = useRouter()
  const [rangeOpen, setRangeOpen] = useState(period === "custom")
  const [customFrom, setCustomFrom] = useState(from)
  const [customTo, setCustomTo] = useState(to)

  const paymentEntries = Object.entries(current.paymentMethods) as [PaymentMethod, number][]

  function applyCustomRange() {
    if (!customFrom || !customTo) return
    const [start, end] = customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom]
    router.push(`/dashboard/custom?from=${start}&to=${end}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/dashboard" className="text-sm text-ink-muted">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink">{label}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {PERIOD_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/${tab.value}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              period === tab.value
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setRangeOpen((v) => !v)}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium ${
            period === "custom"
              ? "border-brand bg-brand text-white"
              : "border-line bg-surface text-ink-muted"
          }`}
        >
          Custom
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {rangeOpen && (
        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-surface p-3 shadow-card">
          <div>
            <label className="mb-1 block text-xs text-ink-muted">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-muted">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={applyCustomRange}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            View
          </button>
        </div>
      )}

      <StatCard label={label} revenue={current.revenue} expenses={current.expenses} net={current.net} />

      {comparison && (
        <div className="rounded-2xl bg-surface px-4 py-3 text-sm shadow-card">
          {comparison.revenueChangePct === null ? (
            <span className="text-ink-muted">
              Not enough data from {comparison.previousLabel} to compare yet.
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium">
              {comparison.revenueChangePct >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger" />
              )}
              <span className={comparison.revenueChangePct >= 0 ? "text-success" : "text-danger"}>
                {Math.abs(comparison.revenueChangePct).toFixed(0)}%
              </span>
              <span className="text-ink-muted">revenue vs. {comparison.previousLabel}</span>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Transactions" value={String(current.transactionCount)} />
        <MiniStat label="Average ticket" value={formatCurrency(current.averageTicket)} />
      </div>

      {paymentEntries.length > 0 && (
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="mb-3 text-sm font-semibold text-ink-muted">Revenue by payment method</p>
          <div className="flex flex-col gap-2">
            {paymentEntries.map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="text-ink">{PAYMENT_METHOD_LABELS[method]}</span>
                <span className="font-semibold text-success">{formatCurrency(amount ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {period !== "today" && current.dailyRevenue.length > 1 && (
        <RevenueChart data={current.dailyRevenue} />
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-muted">Transactions in this period</h2>
          <Link href={`/transactions?from=${from}&to=${to}`} className="text-sm font-medium text-brand">
            View all →
          </Link>
        </div>

        {current.transactions.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
            <Receipt className="mx-auto h-8 w-8 text-ink-muted" />
            <p className="mt-2 text-sm text-ink-muted">No transactions in this period.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            {current.transactions.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {t.type === "income" ? t.customers?.name ?? "Walk-in" : "Expense"}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {formatDate(t.transaction_date)} ·{" "}
                    {t.type === "income"
                      ? t.service_name
                      : EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory]}
                    {t.type === "income" &&
                      t.payment_method &&
                      ` · ${PAYMENT_METHOD_LABELS[t.payment_method as PaymentMethod]}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-semibold ${t.type === "income" ? "text-success" : "text-danger"}`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
