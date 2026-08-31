import { formatCurrency } from "@/lib/format"

type Point = { date: string; revenue: number }

function shortDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(new Date(year, month - 1, day))
}

export function RevenueChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((p) => p.revenue))
  const labelStep = data.length <= 10 ? 1 : Math.ceil(data.length / 8)

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="mb-3 text-sm font-semibold text-ink-muted">Revenue by day</p>
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {data.map((point, i) => {
          const heightPct = point.revenue > 0 ? Math.max(4, (point.revenue / max) * 100) : 2
          return (
            <div key={point.date} className="flex min-w-[10px] flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-t ${point.revenue > 0 ? "bg-brand" : "bg-line"}`}
                  style={{ height: `${heightPct}%` }}
                  title={`${point.date}: ${formatCurrency(point.revenue)}`}
                />
              </div>
              {i % labelStep === 0 && (
                <span className="text-[10px] text-ink-muted">{shortDayLabel(point.date)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
