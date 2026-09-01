import { getDashboardOverview } from "@/lib/data/finance"
import { StatCard } from "@/components/stat-card"
import { LocalTodayRedirect } from "@/components/local-today-redirect"

export const dynamic = "force-dynamic"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { today?: string }
}) {
  if (!searchParams.today || !ISO_DATE_PATTERN.test(searchParams.today)) {
    return <LocalTodayRedirect basePath="/dashboard" />
  }

  const clientToday = searchParams.today
  const stats = await getDashboardOverview(clientToday)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted">Your business, at a glance.</p>
      </div>

      <StatCard
        label="Today"
        revenue={stats.today.revenue}
        expenses={stats.today.expenses}
        net={stats.today.net}
        transactionCount={stats.today.transactionCount}
        href={`/dashboard/today?today=${clientToday}`}
      />
      <StatCard
        label="This Week"
        revenue={stats.week.revenue}
        expenses={stats.week.expenses}
        net={stats.week.net}
        transactionCount={stats.week.transactionCount}
        href={`/dashboard/week?today=${clientToday}`}
      />
      <StatCard
        label="This Month"
        revenue={stats.month.revenue}
        expenses={stats.month.expenses}
        net={stats.month.net}
        transactionCount={stats.month.transactionCount}
        href={`/dashboard/month?today=${clientToday}`}
      />
    </div>
  )
}
