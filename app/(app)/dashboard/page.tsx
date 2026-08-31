import { getDashboardStats } from "@/lib/data/dashboard"
import { StatCard, MiniStat } from "@/components/stat-card"
import { formatCurrency } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted">Your business, at a glance.</p>
      </div>

      <StatCard label="Today" revenue={stats.today.revenue} expenses={stats.today.expenses} net={stats.today.net} />
      <StatCard label="This Week" revenue={stats.week.revenue} expenses={stats.week.expenses} net={stats.week.net} />
      <StatCard label="This Month" revenue={stats.month.revenue} expenses={stats.month.expenses} net={stats.month.net} />

      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Services this month" value={String(stats.month.serviceCount)} />
        <MiniStat label="Average service value" value={formatCurrency(stats.month.averageServiceValue)} />
      </div>
    </div>
  )
}
