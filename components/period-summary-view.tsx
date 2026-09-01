"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  addDays,
  addWeeks,
  startOfMonth,
  endOfMonth,
  formatISO,
} from "date-fns"
import { ArrowUpRight, ArrowDownRight, Receipt, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
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
import type { TransactionWithCustomer } from "@/lib/data/transactions"

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: "today", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

export type PeriodComparison = {
  previousLabel: string
  revenueChangePct: number | null
} | null

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  return formatISO(date, { representation: "date" })
}

function formatRecordedTime(createdAt: string): string {
  return new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function PeriodSummaryView({
  period,
  label,
  isCurrent,
  anchorDate,
  clientToday,
  from,
  to,
  current,
  comparison,
}: {
  period: Period
  label: string
  isCurrent: boolean
  anchorDate: string
  clientToday: string
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
  const showDayDetail = period === "today" || (period === "custom" && from === to)

  function goTo(nextPeriod: Period, nextAnchor: string) {
    router.push(`/dashboard/${nextPeriod}?date=${nextAnchor}&today=${clientToday}`)
  }

  function applyCustomRange() {
    if (!customFrom || !customTo) return
    const [start, end] = customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom]
    router.push(`/dashboard/custom?from=${start}&to=${end}&today=${clientToday}`)
  }

  function handlePrevious() {
    const anchor = parseIsoDate(anchorDate)
    if (period === "week") goTo(period, toIsoDate(addWeeks(anchor, -1)))
    else if (period === "month") goTo(period, toIsoDate(addDays(startOfMonth(anchor), -1)))
    else goTo(period, toIsoDate(addDays(anchor, -1)))
  }

  function handleNext() {
    const anchor = parseIsoDate(anchorDate)
    if (period === "week") goTo(period, toIsoDate(addWeeks(anchor, 1)))
    else if (period === "month") goTo(period, toIsoDate(addDays(endOfMonth(anchor), 1)))
    else goTo(period, toIsoDate(addDays(anchor, 1)))
  }

  const todayButtonLabel = period === "week" ? "Current Week" : period === "month" ? "Current Month" : "Today"
  const headerTitle =
    isCurrent && period === "today"
      ? `Today — ${label}`
      : isCurrent && period === "week"
        ? `This Week — ${label}`
        : isCurrent && period === "month"
          ? `This Month — ${label}`
          : label

  const incomeRows = current.transactions
    .filter((t) => t.type === "income")
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const expenseRows = current.transactions.filter((t) => t.type === "expense")

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/dashboard" className="text-sm text-ink-muted">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink">{headerTitle}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setRangeOpen(false)
              goTo(tab.value, clientToday)
            }}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              period === tab.value
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-muted"
            }`}
          >
            {tab.label}
          </button>
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

      {rangeOpen ? (
        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-surface p-3 shadow-card">
          <div>
            <label className="mb-1 block text-xs text-ink-muted">Start Date</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-muted">End Date</label>
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
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous"
              className="rounded-full p-2 text-ink-muted active:bg-line/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(period, clientToday)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink"
            >
              {todayButtonLabel}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next"
              className="rounded-full p-2 text-ink-muted active:bg-line/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {period === "today" && (
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => e.target.value && goTo("today", e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink"
              aria-label="Pick a day"
            />
          )}
          {period === "week" && (
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => e.target.value && goTo("week", e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink"
              aria-label="Jump to the week containing this date"
            />
          )}
          {period === "month" && (
            <input
              type="month"
              value={anchorDate.slice(0, 7)}
              onChange={(e) => e.target.value && goTo("month", `${e.target.value}-01`)}
              className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink"
              aria-label="Pick a month"
            />
          )}
        </div>
      )}

      <StatCard
        label={label}
        revenue={current.revenue}
        expenses={current.expenses}
        net={current.net}
        transactionCount={current.transactionCount}
      />

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

      {current.serviceCount > 0 && (
        <MiniStat label="Average ticket" value={formatCurrency(current.averageTicket)} />
      )}

      {showDayDetail ? (
        <DayDetail incomeRows={incomeRows} expenseRows={expenseRows} current={current} paymentEntries={paymentEntries} />
      ) : (
        <>
          {paymentEntries.length > 0 && (
            <PaymentBreakdown paymentEntries={paymentEntries} />
          )}

          {current.dailyBreakdown.length > 1 && <RevenueChart data={current.dailyBreakdown} />}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink-muted">Daily Breakdown</h2>
            <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
              {current.dailyBreakdown.map((day, i) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => goTo("today", day.date)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-brand-light ${
                    i !== 0 ? "border-t border-line" : ""
                  } ${day.revenue === 0 ? "opacity-60" : ""}`}
                >
                  <span className="text-sm font-medium text-ink">{formatDate(day.date)}</span>
                  <span className="flex items-center gap-3 text-sm">
                    <span className="text-ink-muted">
                      {day.transactionCount} transaction{day.transactionCount === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold text-success">{formatCurrency(day.revenue)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-muted">All transactions in this period</h2>
          <Link href={`/transactions?from=${from}&to=${to}`} className="text-sm font-medium text-brand">
            View all →
          </Link>
        </div>

        {current.transactions.length === 0 && (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
            <Receipt className="mx-auto h-8 w-8 text-ink-muted" />
            <p className="mt-2 text-sm text-ink-muted">No transactions for this period.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PaymentBreakdown({ paymentEntries }: { paymentEntries: [PaymentMethod, number][] }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="mb-3 text-sm font-semibold text-ink-muted">Payment Breakdown</p>
      <div className="flex flex-col gap-2">
        {paymentEntries.map(([method, amount]) => (
          <div key={method} className="flex items-center justify-between text-sm">
            <span className="text-ink">{PAYMENT_METHOD_LABELS[method]}</span>
            <span className="font-semibold text-success">{formatCurrency(amount ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DayDetail({
  incomeRows,
  expenseRows,
  current,
  paymentEntries,
}: {
  incomeRows: TransactionWithCustomer[]
  expenseRows: TransactionWithCustomer[]
  current: PeriodFinancials
  paymentEntries: [PaymentMethod, number][]
}) {
  return (
    <>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-muted">Services</h2>
        {incomeRows.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
            <Receipt className="mx-auto h-8 w-8 text-ink-muted" />
            <p className="mt-2 text-sm text-ink-muted">No revenue for this period.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            {incomeRows.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs text-ink-muted">{formatRecordedTime(t.created_at)}</p>
                  <p className="truncate font-medium text-ink">{t.customers?.name ?? "Walk-in"}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {t.service_name}
                    {t.payment_method && ` · ${PAYMENT_METHOD_LABELS[t.payment_method as PaymentMethod]}`}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-success">
                  {formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card">
        <span className="text-sm font-semibold text-ink-muted">Total Revenue</span>
        <span className="text-lg font-bold text-success">{formatCurrency(current.revenue)}</span>
      </div>

      {paymentEntries.length > 0 && <PaymentBreakdown paymentEntries={paymentEntries} />}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-muted">Expenses</h2>
        {expenseRows.length === 0 ? (
          <div className="rounded-2xl bg-surface p-6 text-center shadow-card">
            <p className="text-sm text-ink-muted">No expenses for this day.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            {expenseRows.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-line" : ""}`}
              >
                <span className="text-sm font-medium text-ink">
                  {EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory]}
                </span>
                <span className="text-sm font-semibold text-danger">
                  {formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card">
        <span className="text-sm font-semibold text-ink-muted">Total Expenses</span>
        <span className="text-lg font-bold text-danger">{formatCurrency(current.expenses)}</span>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-4 shadow-card">
        <span className="text-sm font-semibold text-white/80">NET</span>
        <span className="text-2xl font-bold text-white">{formatCurrency(current.net)}</span>
      </div>
    </>
  )
}
