import { BUSINESS_HOURS_END, BUSINESS_HOURS_START, APPOINTMENT_STATUS_STYLES } from "@/lib/constants"
import { formatCurrency, formatTime12h } from "@/lib/format"
import type { AppointmentWithClient } from "@/lib/data/appointments"

const SLOT_MINUTES = 30
const SLOT_HEIGHT = 68

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function DayView({
  date,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: {
  date: string
  appointments: AppointmentWithClient[]
  onSlotClick: (date: string, startTime: string) => void
  onAppointmentClick: (appointment: AppointmentWithClient) => void
}) {
  const businessStart = BUSINESS_HOURS_START * 60
  const businessEnd = BUSINESS_HOURS_END * 60
  const slotCount = (businessEnd - businessStart) / SLOT_MINUTES

  const dayAppointments = appointments.filter(
    (a) => a.appointment_date === date && a.status !== "cancelled"
  )

  const occupiedSlots = new Set<number>()
  for (const appt of dayAppointments) {
    const startIdx = Math.max(0, Math.floor((timeToMinutes(appt.start_time) - businessStart) / SLOT_MINUTES))
    const endIdx = Math.min(slotCount, Math.ceil((timeToMinutes(appt.end_time) - businessStart) / SLOT_MINUTES))
    for (let i = startIdx; i < endIdx; i++) occupiedSlots.add(i)
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <div className="flex">
        <div className="w-16 shrink-0">
          {Array.from({ length: slotCount }, (_, i) => {
            const minutes = businessStart + i * SLOT_MINUTES
            const isHour = minutes % 60 === 0
            return (
              <div
                key={i}
                style={{ height: SLOT_HEIGHT }}
                className="border-t border-line/70 pr-2 pt-0.5 text-right text-xs font-semibold text-ink-muted sm:text-sm"
              >
                {isHour ? formatTime12h(minutesToTime(minutes)) : ""}
              </div>
            )
          })}
        </div>

        <div className="relative flex-1 border-l border-line" style={{ height: slotCount * SLOT_HEIGHT }}>
          {Array.from({ length: slotCount }, (_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-t border-line/70"
              style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            >
              {!occupiedSlots.has(i) && (
                <button
                  type="button"
                  onClick={() => onSlotClick(date, minutesToTime(businessStart + i * SLOT_MINUTES))}
                  className="h-full w-full hover:bg-brand-light/30"
                  aria-label={`Add appointment at ${minutesToTime(businessStart + i * SLOT_MINUTES)}`}
                />
              )}
            </div>
          ))}

          {dayAppointments.map((appt) => {
            const startMinutes = Math.max(businessStart, timeToMinutes(appt.start_time))
            const endMinutes = Math.min(businessEnd, timeToMinutes(appt.end_time))
            const top = ((startMinutes - businessStart) / SLOT_MINUTES) * SLOT_HEIGHT
            const height = Math.max(
              52,
              ((endMinutes - startMinutes) / SLOT_MINUTES) * SLOT_HEIGHT - 2
            )
            const styles =
              APPOINTMENT_STATUS_STYLES[appt.status as keyof typeof APPOINTMENT_STATUS_STYLES] ??
              APPOINTMENT_STATUS_STYLES.scheduled

            return (
              <button
                key={appt.id}
                type="button"
                onClick={() => onAppointmentClick(appt)}
                className={`absolute inset-x-1 overflow-hidden rounded-lg px-3 py-1.5 text-left shadow-card ${styles.card}`}
                style={{ top, height }}
              >
                <p className="truncate text-sm font-bold leading-tight sm:text-base">
                  {formatTime12h(appt.start_time)}
                </p>
                <p className="truncate text-base font-bold leading-tight sm:text-lg">
                  {appt.customers?.name ?? "Walk-in"}
                </p>
                <p className="truncate text-xs leading-tight opacity-80">
                  {appt.service}
                  {appt.price ? ` · ${formatCurrency(Number(appt.price))}` : ""}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
