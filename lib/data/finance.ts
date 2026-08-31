import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  formatISO,
} from "date-fns"
import { getTransactions, type TransactionWithCustomer } from "./transactions"
import type { PaymentMethod } from "@/lib/constants"

export type Period = "today" | "week" | "month" | "custom"

export type PeriodRange = {
  from: string
  to: string
  label: string
  previousFrom?: string
  previousTo?: string
  previousLabel?: string
}

export type PeriodFinancials = {
  from: string
  to: string
  revenue: number
  expenses: number
  net: number
  transactionCount: number
  serviceCount: number
  averageTicket: number
  paymentMethods: Partial<Record<PaymentMethod, number>>
  dailyRevenue: { date: string; revenue: number }[]
  transactions: TransactionWithCustomer[]
}

function toIsoDate(date: Date): string {
  return formatISO(date, { representation: "date" })
}

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function resolvePeriodRange(
  period: Period,
  customFrom?: string,
  customTo?: string
): PeriodRange {
  const now = new Date()
  const today = toIsoDate(startOfDay(now))

  if (period === "week") {
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const previousWeekStart = subWeeks(weekStart, 1)
    const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 0 })
    return {
      from: toIsoDate(weekStart),
      to: today,
      label: "This Week",
      previousFrom: toIsoDate(previousWeekStart),
      previousTo: toIsoDate(previousWeekEnd),
      previousLabel: "last week",
    }
  }

  if (period === "month") {
    const monthStart = startOfMonth(now)
    const previousMonthStart = startOfMonth(subMonths(now, 1))
    const previousMonthEnd = endOfMonth(previousMonthStart)
    return {
      from: toIsoDate(monthStart),
      to: today,
      label: "This Month",
      previousFrom: toIsoDate(previousMonthStart),
      previousTo: toIsoDate(previousMonthEnd),
      previousLabel: "last month",
    }
  }

  if (period === "custom") {
    const from = customFrom || toIsoDate(startOfMonth(now))
    const to = customTo || today
    const [start, end] = from <= to ? [from, to] : [to, from]
    return { from: start, to: end, label: "Custom Range" }
  }

  return { from: today, to: today, label: "Today" }
}

export async function getPeriodFinancials(from: string, to: string): Promise<PeriodFinancials> {
  const transactions = await getTransactions({ from, to })

  let revenue = 0
  let expenses = 0
  let serviceCount = 0
  const paymentMethods: Partial<Record<PaymentMethod, number>> = {}
  const revenueByDay = new Map<string, number>()

  for (const t of transactions) {
    const amount = Number(t.amount)
    if (t.type === "income") {
      revenue += amount
      serviceCount += 1
      if (t.payment_method) {
        const method = t.payment_method as PaymentMethod
        paymentMethods[method] = (paymentMethods[method] ?? 0) + amount
      }
      revenueByDay.set(t.transaction_date, (revenueByDay.get(t.transaction_date) ?? 0) + amount)
    } else {
      expenses += amount
    }
  }

  const dailyRevenue = eachDayOfInterval({
    start: parseIsoDate(from),
    end: parseIsoDate(to),
  }).map((day) => {
    const key = toIsoDate(day)
    return { date: key, revenue: revenueByDay.get(key) ?? 0 }
  })

  return {
    from,
    to,
    revenue,
    expenses,
    net: revenue - expenses,
    transactionCount: transactions.length,
    serviceCount,
    averageTicket: serviceCount > 0 ? revenue / serviceCount : 0,
    paymentMethods,
    dailyRevenue,
    transactions,
  }
}
