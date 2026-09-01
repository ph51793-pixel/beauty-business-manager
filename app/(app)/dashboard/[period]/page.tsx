import { notFound } from "next/navigation"
import { getPeriodFinancials, resolvePeriodRange, type Period } from "@/lib/data/finance"
import { PeriodSummaryView, type PeriodComparison } from "@/components/period-summary-view"
import { LocalTodayRedirect } from "@/components/local-today-redirect"

export const dynamic = "force-dynamic"

const VALID_PERIODS: Period[] = ["today", "week", "month", "custom"]
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function PeriodPage({
  params,
  searchParams,
}: {
  params: { period: string }
  searchParams: { from?: string; to?: string; date?: string; today?: string }
}) {
  if (!VALID_PERIODS.includes(params.period as Period)) notFound()
  const period = params.period as Period

  if (!searchParams.today || !ISO_DATE_PATTERN.test(searchParams.today)) {
    const extraParams: Record<string, string> = {}
    if (searchParams.date) extraParams.date = searchParams.date
    if (searchParams.from) extraParams.from = searchParams.from
    if (searchParams.to) extraParams.to = searchParams.to
    return <LocalTodayRedirect basePath={`/dashboard/${period}`} extraParams={extraParams} />
  }

  const clientToday = searchParams.today

  // `date` re-anchors which day/week/month is being viewed (Previous/Next,
  // pickers, clicking a day in a breakdown list). Absent, it defaults to
  // clientToday — i.e. the current day/week/month.
  const anchorDate =
    searchParams.date && ISO_DATE_PATTERN.test(searchParams.date) ? searchParams.date : clientToday

  const range = resolvePeriodRange(period, anchorDate, clientToday, searchParams.from, searchParams.to)
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
      isCurrent={range.isCurrent}
      anchorDate={anchorDate}
      clientToday={clientToday}
      from={range.from}
      to={range.to}
      current={current}
      comparison={comparison}
    />
  )
}
