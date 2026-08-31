import { notFound } from "next/navigation"
import { getPeriodFinancials, resolvePeriodRange, type Period } from "@/lib/data/finance"
import { PeriodSummaryView, type PeriodComparison } from "@/components/period-summary-view"

export const dynamic = "force-dynamic"

const VALID_PERIODS: Period[] = ["today", "week", "month", "custom"]

export default async function PeriodPage({
  params,
  searchParams,
}: {
  params: { period: string }
  searchParams: { from?: string; to?: string }
}) {
  if (!VALID_PERIODS.includes(params.period as Period)) notFound()
  const period = params.period as Period

  const range = resolvePeriodRange(period, searchParams.from, searchParams.to)
  const current = await getPeriodFinancials(range.from, range.to)

  let comparison: PeriodComparison = null

  if (range.previousFrom && range.previousTo && range.previousLabel) {
    const previous = await getPeriodFinancials(range.previousFrom, range.previousTo)
    comparison = {
      previousLabel: range.previousLabel,
      revenueChangePct:
        previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : null,
    }
  }

  return (
    <PeriodSummaryView
      period={period}
      label={range.label}
      from={range.from}
      to={range.to}
      current={current}
      comparison={comparison}
    />
  )
}
