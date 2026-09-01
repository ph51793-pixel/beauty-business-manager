import {
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  subWeeks,
  subMonths,
  addDays,
  eachDayOfInterval,
  formatISO,
  format,
} from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { getTransactions, type TransactionWithCustomer } from "./transactions"
import type { PaymentMethod } from "@/lib/constants"

export type Period = "today" | "week" | "month" | "custom"

export type PeriodRange = {
  from: string
  to: string
  label: string
  /** true when the viewed day/week/month is the one containing the visitor's real today */
  isCurrent: boolean
  previousFrom?: string
  previousTo?: string
  previousLabel?: string
}

export type CoreStats = {
  revenue: number
  expenses: number
  net: number
  transactionCount: number
  serviceCount: number
  averageTicket: number
  paymentMethods: Partial<Record<PaymentMethod, number>>
}

export type PeriodFinancials = CoreStats & {
  from: string
  to: string
  dailyBreakdown: { date: string; revenue: number; transactionCount: number }[]
  transactions: TransactionWithCustomer[]
}

export type DashboardOverview = {
  today: CoreStats
  week: CoreStats
  month: CoreStats
}

function toIsoDate(date: Date): string {
  return formatISO(date, { representation: "date" })
}

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Reduces a set of transaction rows into revenue/expenses/net/payment-method
 * totals. This is the ONLY place that logic lives — every screen that shows a
 * money total (Dashboard cards, the Day/Week/Month/Custom pages) calls this
 * on its own rows so the same $ always adds up the same way everywhere.
 */
export function aggregateCore(rows: TransactionWithCustomer[]): CoreStats {
  let revenue = 0
  let expenses = 0
  let serviceCount = 0
  const paymentMethods: Partial<Record<PaymentMethod, number>> = {}

  for (const t of rows) {
    const amount = Number(t.amount)
    if (t.type === "income") {
      revenue += amount
      serviceCount += 1
      if (t.payment_method) {
        const method = t.payment_method as PaymentMethod
        paymentMethods[method] = (paymentMethods[method] ?? 0) + amount
      }
    } else {
      expenses += amount
    }
  }

  return {
    revenue,
    expenses,
    net: revenue - expenses,
    transactionCount: rows.length,
    serviceCount,
    averageTicket: serviceCount > 0 ? revenue / serviceCount : 0,
    paymentMethods,
  }
}

/**
 * `anchorDate` is which day/week/month to show (moved by Previous/Next/the
 * date pickers); `clientToday` is always the visitor's real local today (see
 * components/local-today-redirect.tsx), used only to label the period as
 * "current" and as the base for the Previous/Next-day default. Neither is
 * ever computed here from the server's clock — Vercel runs in UTC, which can
 * already be "tomorrow" while it's still "today" for a US-based owner, and
 * deriving month/week boundaries from the server's `new Date()` was the root
 * cause of the Dashboard excluding today's (and this month's) real
 * transactions from every query.
 */
export function resolvePeriodRange(
  period: Period,
  anchorDate: string,
  clientToday: string,
  customFrom?: string,
  customTo?: string
): PeriodRange {
  const anchor = parseIsoDate(anchorDate)

  if (period === "week") {
    const weekStart = startOfWeek(anchor, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(anchor, { weekStartsOn: 0 })
    const previousWeekStart = subWeeks(weekStart, 1)
    const previousWeekEnd = subWeeks(weekEnd, 1)
    const isCurrent = toIsoDate(weekStart) <= clientToday && clientToday <= toIsoDate(weekEnd)
    return {
      from: toIsoDate(weekStart),
      to: toIsoDate(weekEnd),
      label: `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`,
      isCurrent,
      previousFrom: toIsoDate(previousWeekStart),
      previousTo: toIsoDate(previousWeekEnd),
      previousLabel: "previous week",
    }
  }

  if (period === "month") {
    const monthStart = startOfMonth(anchor)
    const monthEnd = endOfMonth(anchor)
    const previousMonthStart = startOfMonth(subMonths(anchor, 1))
    const previousMonthEnd = endOfMonth(previousMonthStart)
    const isCurrent = toIsoDate(monthStart) <= clientToday && clientToday <= toIsoDate(monthEnd)
    return {
      from: toIsoDate(monthStart),
      to: toIsoDate(monthEnd),
      label: format(anchor, "MMMM yyyy"),
      isCurrent,
      previousFrom: toIsoDate(previousMonthStart),
      previousTo: toIsoDate(previousMonthEnd),
      previousLabel: "previous month",
    }
  }

  if (period === "custom") {
    const from = customFrom || anchorDate
    const to = customTo || anchorDate
    const [start, end] = from <= to ? [from, to] : [to, from]
    return {
      from: start,
      to: end,
      label: start === end ? format(parseIsoDate(start), "MMMM d, yyyy") : `${format(parseIsoDate(start), "MMM d")} – ${format(parseIsoDate(end), "MMM d, yyyy")}`,
      isCurrent: start === end && start === clientToday,
    }
  }

  // "today" period = single-day view anchored at anchorDate (defaults to clientToday)
  return {
    from: anchorDate,
    to: anchorDate,
    label: format(anchor, "EEEE, MMMM d, yyyy"),
    isCurrent: anchorDate === clientToday,
  }
}

export function shiftAnchor(period: Period, anchorDate: string, direction: 1 | -1): string {
  const anchor = parseIsoDate(anchorDate)
  if (period === "week") return toIsoDate(addDays(anchor, 7 * direction))
  if (period === "month") {
    const shifted = direction === 1 ? addDays(endOfMonth(anchor), 1) : addDays(startOfMonth(anchor), -1)
    return toIsoDate(shifted)
  }
  return toIsoDate(addDays(anchor, direction))
}

export async function getPeriodFinancials(from: string, to: string): Promise<PeriodFinancials> {
  const transactions = await getTransactions({ from, to })
  const core = aggregateCore(transactions)

  const revenueByDay = new Map<string, number>()
  const countByDay = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== "income") continue
    const amount = Number(t.amount)
    revenueByDay.set(t.transaction_date, (revenueByDay.get(t.transaction_date) ?? 0) + amount)
    countByDay.set(t.transaction_date, (countByDay.get(t.transaction_date) ?? 0) + 1)
  }

  const dailyBreakdown = eachDayOfInterval({
    start: parseIsoDate(from),
    end: parseIsoDate(to),
  }).map((day) => {
    const key = toIsoDate(day)
    return {
      date: key,
      revenue: revenueByDay.get(key) ?? 0,
      transactionCount: countByDay.get(key) ?? 0,
    }
  })

  return {
    ...core,
    from,
    to,
    dailyBreakdown,
    transactions,
  }
}

/**
 * Backs the main Dashboard cards. One query from this month's start (in the
 * visitor's local time) through today, bucketed into today/week/month and
 * reduced with the same `aggregateCore` the Day/Week/Month/Custom pages use.
 */
export async function getDashboardOverview(clientToday: string): Promise<DashboardOverview> {
  const supabase = await createClient()
  const now = parseIsoDate(clientToday)
  const monthStart = toIsoDate(startOfMonth(now))
  const weekStart = toIsoDate(startOfWeek(now, { weekStartsOn: 0 }))

  const { data, error } = await supabase
    .from("transactions")
    .select("*, customers(id, name)")
    .gte("transaction_date", monthStart)
    .lte("transaction_date", clientToday)

  if (error) throw error

  const rows = (data ?? []) as unknown as TransactionWithCustomer[]
  const todayRows = rows.filter((r) => r.transaction_date === clientToday)
  const weekRows = rows.filter((r) => r.transaction_date >= weekStart)

  return {
    today: aggregateCore(todayRows),
    week: aggregateCore(weekRows),
    month: aggregateCore(rows),
  }
}
