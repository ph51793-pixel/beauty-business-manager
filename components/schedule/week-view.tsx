import { startOfWeek, addDays } from "date-fns"
import { BUSINESS_HOURS_END, BUSINESS_HOURS_START } from "@/lib/constants"
import { todayIsoDate } from "@/lib/format"
import { parseIsoDate, toIso } from "@/lib/schedule/time"
import { TimeColumn } from "./time-column"
import { DayColumn } from "./day-column"
import type { AppointmentWithClient } from "@/lib/data/appointments"

const SLOT_MINUTES = 30
const SLOT_HEIGHT = 44

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
  const today = todayIsoDate()

  const activeAppointments = appointments.filter((a) => a.status !== "cancelled")

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      {/* Day header row — identifies each day; the appointment cards below carry the pink highlight, not this row. */}
      <div className="sticky top-0 z-20 flex border-b border-line bg-surface md:top-[65px]">
        <div className="w-14 shrink-0 sm:w-16" />
        {days.map((day) => {
          const iso = toIso(day)
          const isToday = iso === today
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onOpenDay(iso)}
              className="flex flex-1 flex-col items-center gap-0.5 border-l border-line py-2 text-center active:bg-brand-light/40"
            >
              <span className="text-[10px] font-medium uppercase text-ink-muted sm:text-xs">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold sm:h-7 sm:w-7 sm:text-base ${
                  isToday ? "bg-ink text-white" : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex">
        <TimeColumn
          businessStart={BUSINESS_HOURS_START}
          businessEnd={BUSINESS_HOURS_END}
          slotMinutes={SLOT_MINUTES}
          slotHeight={SLOT_HEIGHT}
        />
        <div className="grid flex-1 grid-cols-7">
          {days.map((day) => {
            const iso = toIso(day)
            const dayAppointments = activeAppointments.filter((a) => a.appointment_date === iso)
            return (
              <DayColumn
                key={iso}
                date={iso}
                appointments={dayAppointments}
                businessStart={BUSINESS_HOURS_START}
                businessEnd={BUSINESS_HOURS_END}
                slotMinutes={SLOT_MINUTES}
                slotHeight={SLOT_HEIGHT}
                onSlotClick={onSlotClick}
                onAppointmentClick={onAppointmentClick}
                isToday={iso === today}
                dense
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
