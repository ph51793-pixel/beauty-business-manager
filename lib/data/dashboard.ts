import { startOfMonth, startOfWeek, startOfDay, formatISO } from "date-fns"
import { createClient } from "@/lib/supabase/server"

export type PeriodStats = {
  revenue: number
  expenses: number
  net: number
  serviceCount: number
  averageServiceValue: number
}

export type DashboardStats = {
  today: PeriodStats
  week: PeriodStats
  month: PeriodStats
}

function emptyStats(): PeriodStats {
  return { revenue: 0, expenses: 0, net: 0, serviceCount: 0, averageServiceValue: 0 }
}

function accumulate(stats: PeriodStats, type: string, amount: number) {
  if (type === "income") {
    stats.revenue += amount
    stats.serviceCount += 1
  } else {
    stats.expenses += amount
  }
}

function finalize(stats: PeriodStats) {
  stats.net = stats.revenue - stats.expenses
  stats.averageServiceValue = stats.serviceCount > 0 ? stats.revenue / stats.serviceCount : 0
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = formatISO(startOfMonth(now), { representation: "date" })
  const weekStart = formatISO(startOfWeek(now, { weekStartsOn: 0 }), { representation: "date" })
  const todayStart = formatISO(startOfDay(now), { representation: "date" })

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .gte("transaction_date", monthStart)

  if (error) throw error

  const today = emptyStats()
  const week = emptyStats()
  const month = emptyStats()

  for (const row of data ?? []) {
    const amount = Number(row.amount)
    accumulate(month, row.type, amount)
    if (row.transaction_date >= weekStart) accumulate(week, row.type, amount)
    if (row.transaction_date >= todayStart) accumulate(today, row.type, amount)
  }

  finalize(today)
  finalize(week)
  finalize(month)

  return { today, week, month }
}
