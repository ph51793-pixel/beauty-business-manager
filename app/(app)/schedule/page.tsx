import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, formatISO } from "date-fns"
import { getAppointmentsInRange } from "@/lib/data/appointments"
import { getCustomers } from "@/lib/data/customers"
import { ScheduleView, type ScheduleViewMode } from "@/components/schedule/schedule-view"
import { todayIsoDate } from "@/lib/format"

export const dynamic = "force-dynamic"

function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIso(date: Date): string {
  return formatISO(date, { representation: "date" })
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string }
}) {
  const view: ScheduleViewMode =
    searchParams.view === "week" || searchParams.view === "day" ? searchParams.view : "month"

  const anchorDate =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : todayIsoDate()

  const anchor = parseIsoDate(anchorDate)

  let rangeFrom: Date
  let rangeTo: Date

  if (view === "month") {
    rangeFrom = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
    rangeTo = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  } else if (view === "week") {
    rangeFrom = startOfWeek(anchor, { weekStartsOn: 0 })
    rangeTo = endOfWeek(anchor, { weekStartsOn: 0 })
  } else {
    rangeFrom = anchor
    rangeTo = anchor
  }

  const today = todayIsoDate()
  const needsSeparateTodayFetch = today < toIso(rangeFrom) || today > toIso(rangeTo)

  const [appointments, todayAppointments, customers] = await Promise.all([
    getAppointmentsInRange(toIso(rangeFrom), toIso(rangeTo)),
    needsSeparateTodayFetch ? getAppointmentsInRange(today, today) : Promise.resolve(null),
    getCustomers(),
  ])

  return (
    <ScheduleView
      view={view}
      anchorDate={anchorDate}
      appointments={appointments}
      todayAppointments={needsSeparateTodayFetch ? todayAppointments! : appointments.filter((a) => a.appointment_date === today)}
      customers={customers}
    />
  )
}
