import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, formatISO } from "date-fns"
import { getAppointmentsInRange } from "@/lib/data/appointments"
import { getCustomers } from "@/lib/data/customers"
import { ScheduleView, type ScheduleViewMode } from "@/components/schedule/schedule-view"
import { RedirectToToday } from "@/components/schedule/redirect-to-today"
import { todayIsoDate } from "@/lib/format"

export const dynamic = "force-dynamic"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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
  searchParams: { view?: string; date?: string; today?: string }
}) {
  const view: ScheduleViewMode =
    searchParams.view === "week" || searchParams.view === "day" ? searchParams.view : "month"

  // The server (Vercel) runs in UTC, which can already be "tomorrow" while it's
  // still "today" in the owner's local timezone. Landing here with no ?date=
  // redirects once to the browser's own local today instead of guessing
  // server-side, so the calendar never opens on the wrong day.
  if (!searchParams.date || !ISO_DATE_PATTERN.test(searchParams.date)) {
    return <RedirectToToday view={view} />
  }

  const anchorDate = searchParams.date
  const clientToday =
    searchParams.today && ISO_DATE_PATTERN.test(searchParams.today)
      ? searchParams.today
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

  const needsSeparateTodayFetch = clientToday < toIso(rangeFrom) || clientToday > toIso(rangeTo)

  const [appointments, todayAppointments, customers] = await Promise.all([
    getAppointmentsInRange(toIso(rangeFrom), toIso(rangeTo)),
    needsSeparateTodayFetch ? getAppointmentsInRange(clientToday, clientToday) : Promise.resolve(null),
    getCustomers(),
  ])

  return (
    <ScheduleView
      view={view}
      anchorDate={anchorDate}
      appointments={appointments}
      todayAppointments={
        needsSeparateTodayFetch
          ? todayAppointments!
          : appointments.filter((a) => a.appointment_date === clientToday)
      }
      customers={customers}
    />
  )
}
