import { layoutDayAppointments } from "@/lib/schedule/layout"
import { minutesToTime, timeToMinutes } from "@/lib/schedule/time"
import { AppointmentCard } from "./appointment-card"
import type { AppointmentWithClient } from "@/lib/data/appointments"

/**
 * One day's vertical timeline: hour gridlines, tap-to-create slots, and each
 * appointment positioned (and, when overlapping, laid out side-by-side) at
 * its real start/end time. Shared by both the Day view (one wide column) and
 * the Week view (seven of these side by side).
 */
export function DayColumn({
  date,
  appointments,
  businessStart,
  businessEnd,
  slotMinutes,
  slotHeight,
  onSlotClick,
  onAppointmentClick,
  dense,
  isToday,
}: {
  date: string
  appointments: AppointmentWithClient[]
  businessStart: number
  businessEnd: number
  slotMinutes: number
  slotHeight: number
  onSlotClick: (date: string, startTime: string) => void
  onAppointmentClick: (appointment: AppointmentWithClient) => void
  dense?: boolean
  isToday?: boolean
}) {
  const rangeStart = businessStart * 60
  const rangeEnd = businessEnd * 60
  const slotCount = (rangeEnd - rangeStart) / slotMinutes
  const pxPerMinute = slotHeight / slotMinutes

  const occupiedSlots = new Set<number>()
  for (const appt of appointments) {
    const startIdx = Math.max(0, Math.floor((timeToMinutes(appt.start_time) - rangeStart) / slotMinutes))
    const endIdx = Math.min(slotCount, Math.ceil((timeToMinutes(appt.end_time) - rangeStart) / slotMinutes))
    for (let i = startIdx; i < endIdx; i++) occupiedSlots.add(i)
  }

  const positioned = layoutDayAppointments(appointments, rangeStart, rangeEnd, pxPerMinute, dense ? 32 : 52)

  return (
    <div
      className={`relative border-l border-line ${isToday ? "bg-brand-light/20" : ""}`}
      style={{ height: slotCount * slotHeight }}
    >
      {Array.from({ length: slotCount }, (_, i) => (
        <div
          key={i}
          className="absolute inset-x-0 border-t border-line/70"
          style={{ top: i * slotHeight, height: slotHeight }}
        >
          {!occupiedSlots.has(i) && (
            <button
              type="button"
              onClick={() => onSlotClick(date, minutesToTime(rangeStart + i * slotMinutes))}
              className="h-full w-full hover:bg-brand-light/30"
              aria-label={`Add appointment at ${minutesToTime(rangeStart + i * slotMinutes)}`}
            />
          )}
        </div>
      ))}

      {positioned.map(({ appt, top, height, left, width }) => (
        <AppointmentCard
          key={appt.id}
          appointment={appt}
          dense={dense}
          onClick={() => onAppointmentClick(appt)}
          style={{
            top,
            height,
            left: `calc(${left}% + 2px)`,
            width: `calc(${width}% - 4px)`,
            zIndex: 10,
          }}
        />
      ))}
    </div>
  )
}
