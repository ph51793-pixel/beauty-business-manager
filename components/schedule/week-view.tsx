import { startOfWeek, addDays, formatISO } from "date-fns"
import { BUSINESS_HOURS_END, BUSINESS_HOURS_START, APPOINTMENT_STATUS_STYLES } from "@/lib/constants"
import { formatTime, todayIsoDate } from "@/lib/format"
import type { AppointmentWithClient } from "@/lib/data/appointments"

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIso(date: Date): string {
  return formatISO(date, { representation: "date" })
}

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`
}

export function WeekView({
  anchorDate,
  appointments,
  onOpenDay,
  onSlotClick,
  onAppointmentClick,
}: {
  anchorDate: string
  appointments: AppointmentWithClient[]
  onOpenDay: (date: string) => void
  onSlotClick: (date: string, startTime: string) => void
  onAppointmentClick: (appointment: AppointmentWithClient) => void
}) {
  const weekStart = startOfWeek(parseIsoDate(anchorDate), { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from(
    { length: BUSINESS_HOURS_END - BUSINESS_HOURS_START },
    (_, i) => BUSINESS_HOURS_START + i
  )
  const today = todayIsoDate()

  const activeAppointments = appointments.filter((a) => a.status !== "cancelled")

  function appointmentsFor(dayIso: string, hour: number) {
    return activeAppointments.filter((a) => {
      if (a.appointment_date !== dayIso) return false
      const startHour = Number(a.start_time.slice(0, 2))
      return startHour === hour
    })
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
      <div className="grid min-w-[640px] grid-cols-[56px_repeat(7,1fr)]">
        <div className="border-b border-r border-line" />
        {days.map((day) => {
          const iso = toIso(day)
          const isToday = iso === today
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onOpenDay(iso)}
              className="border-b border-r border-line py-2 text-center last:border-r-0 active:bg-brand-light/40"
            >
              <p className="text-xs font-medium text-ink-muted">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p className={`text-sm font-semibold ${isToday ? "text-brand" : "text-ink"}`}>
                {day.getDate()}
              </p>
            </button>
          )
        })}

        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-r border-t border-line px-1 py-2 text-right text-[10px] text-ink-muted">
              {hourLabel(hour)}
            </div>
            {days.map((day) => {
              const iso = toIso(day)
              const cellAppointments = appointmentsFor(iso, hour)
              return (
                <div
                  key={iso + hour}
                  className="min-h-[44px] border-r border-t border-line p-0.5 last:border-r-0"
                >
                  {cellAppointments.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => onSlotClick(iso, `${String(hour).padStart(2, "0")}:00`)}
                      className="block h-full w-full rounded hover:bg-brand-light/30"
                      aria-label={`Add appointment at ${hourLabel(hour)}`}
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {cellAppointments.slice(0, 2).map((appt) => (
                        <button
                          key={appt.id}
                          type="button"
                          onClick={() => onAppointmentClick(appt)}
                          className={`truncate rounded px-1 py-0.5 text-left text-[10px] font-medium ${APPOINTMENT_STATUS_STYLES[appt.status as keyof typeof APPOINTMENT_STATUS_STYLES]?.card ?? "bg-brand-light text-ink"}`}
                        >
                          {formatTime(appt.start_time)} {appt.customers?.name ?? "Walk-in"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
