import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, formatISO } from "date-fns"
import { formatTime12h, todayIsoDate } from "@/lib/format"
import type { AppointmentWithClient } from "@/lib/data/appointments"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIso(date: Date): string {
  return formatISO(date, { representation: "date" })
}

export function MonthView({
  anchorDate,
  appointments,
  onOpenDay,
}: {
  anchorDate: string
  appointments: AppointmentWithClient[]
  onOpenDay: (date: string) => void
}) {
  const anchor = parseIsoDate(anchorDate)
  const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const currentMonth = anchor.getMonth()
  const today = todayIsoDate()

  const byDay = new Map<string, AppointmentWithClient[]>()
  for (const appt of appointments) {
    const list = byDay.get(appt.appointment_date) ?? []
    list.push(appt)
    byDay.set(appt.appointment_date, list)
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-1 py-2.5 text-center text-xs font-semibold text-ink-muted sm:text-sm">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = toIso(day)
          const isCurrentMonth = day.getMonth() === currentMonth
          const isToday = iso === today
          const dayAppointments = (byDay.get(iso) ?? []).filter((a) => a.status !== "cancelled")
          const hasAppointments = dayAppointments.length > 0
          const visible = dayAppointments.slice(0, 3)
          const extra = dayAppointments.length - visible.length

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onOpenDay(iso)}
              className={`flex min-h-[104px] flex-col items-stretch gap-1 border-b border-r border-line p-2 text-left last:border-r-0 active:opacity-90 sm:min-h-[120px] ${
                hasAppointments
                  ? "rounded-lg bg-brand"
                  : isCurrentMonth
                    ? "bg-surface"
                    : "bg-paper text-ink-muted"
              }`}
            >
              <span
                className={`mb-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold sm:h-8 sm:w-8 sm:text-base ${
                  isToday
                    ? "bg-ink text-white"
                    : hasAppointments
                      ? "text-ink"
                      : isCurrentMonth
                        ? "text-ink"
                        : "text-ink-muted"
                }`}
              >
                {day.getDate()}
              </span>
              {visible.map((appt) => (
                <span key={appt.id} className="truncate text-[11px] font-semibold leading-tight text-ink sm:text-xs">
                  {formatTime12h(appt.start_time)} {appt.customers?.name ?? "Walk-in"}
                </span>
              ))}
              {extra > 0 && (
                <span className="truncate text-[11px] font-bold leading-tight text-ink sm:text-xs">
                  +{extra} more
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
