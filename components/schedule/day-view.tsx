import { BUSINESS_HOURS_END, BUSINESS_HOURS_START } from "@/lib/constants"
import { todayIsoDate } from "@/lib/format"
import { TimeColumn } from "./time-column"
import { DayColumn } from "./day-column"
import type { AppointmentWithClient } from "@/lib/data/appointments"

const SLOT_MINUTES = 30
const SLOT_HEIGHT = 68

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
  const dayAppointments = appointments.filter(
    (a) => a.appointment_date === date && a.status !== "cancelled"
  )

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <div className="flex">
        <TimeColumn
          businessStart={BUSINESS_HOURS_START}
          businessEnd={BUSINESS_HOURS_END}
          slotMinutes={SLOT_MINUTES}
          slotHeight={SLOT_HEIGHT}
        />
        <div className="flex-1">
          <DayColumn
            date={date}
            appointments={dayAppointments}
            businessStart={BUSINESS_HOURS_START}
            businessEnd={BUSINESS_HOURS_END}
            slotMinutes={SLOT_MINUTES}
            slotHeight={SLOT_HEIGHT}
            onSlotClick={onSlotClick}
            onAppointmentClick={onAppointmentClick}
            isToday={date === todayIsoDate()}
          />
        </div>
      </div>
    </div>
  )
}
