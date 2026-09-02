"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { addDays, addMonths, addWeeks, startOfWeek, endOfWeek } from "date-fns"
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { AppointmentModal } from "./appointment-modal"
import { AppointmentDetails } from "./appointment-details"
import { Swipeable } from "./swipeable"
import { formatDateLong, formatTime, todayIsoDate } from "@/lib/format"
import { parseIsoDate, toIso } from "@/lib/schedule/time"
import type { AppointmentWithClient } from "@/lib/data/appointments"
import type { Customer } from "@/lib/data/customers"

export type ScheduleViewMode = "month" | "week" | "day"

type CreateDraft = { date: string; startTime?: string; endTime?: string }

export function ScheduleView({
  view,
  anchorDate,
  appointments,
  todayAppointments,
  customers,
}: {
  view: ScheduleViewMode
  anchorDate: string
  appointments: AppointmentWithClient[]
  todayAppointments: AppointmentWithClient[]
  customers: Customer[]
}) {
  const router = useRouter()
  const [creating, setCreating] = useState<CreateDraft | null>(null)
  const [editing, setEditing] = useState<AppointmentWithClient | null>(null)
  const [viewingDetails, setViewingDetails] = useState<AppointmentWithClient | null>(null)

  const today = todayIsoDate()
  const activeTodayAppointments = todayAppointments.filter((a) => a.status !== "cancelled")

  // Tracks whether navigation moved forward or backward in time so the
  // incoming view can gently slide in from the matching side — a purely
  // cosmetic cue, no data or routing logic depends on it.
  const prevAnchorRef = useRef(anchorDate)
  const [enterDir, setEnterDir] = useState<"left" | "right" | null>(null)
  useEffect(() => {
    if (prevAnchorRef.current !== anchorDate) {
      setEnterDir(parseIsoDate(anchorDate) > parseIsoDate(prevAnchorRef.current) ? "right" : "left")
      prevAnchorRef.current = anchorDate
    }
  }, [anchorDate])

  function goTo(nextView: ScheduleViewMode, nextDate: string) {
    router.push(`/schedule?view=${nextView}&date=${nextDate}&today=${today}`)
  }

  function handlePrevious() {
    const anchor = parseIsoDate(anchorDate)
    if (view === "month") goTo(view, toIso(addMonths(anchor, -1)))
    else if (view === "week") goTo(view, toIso(addWeeks(anchor, -1)))
    else goTo(view, toIso(addDays(anchor, -1)))
  }

  function handleNext() {
    const anchor = parseIsoDate(anchorDate)
    if (view === "month") goTo(view, toIso(addMonths(anchor, 1)))
    else if (view === "week") goTo(view, toIso(addWeeks(anchor, 1)))
    else goTo(view, toIso(addDays(anchor, 1)))
  }

  function handleToday() {
    goTo(view, today)
  }

  function handleOpenDay(date: string) {
    goTo("day", date)
  }

  function handleSlotClick(date: string, startTime: string) {
    const [h, m] = startTime.split(":").map(Number)
    const endHour = h + 1
    const endTime = `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    setCreating({ date, startTime, endTime })
  }

  const anchor = parseIsoDate(anchorDate)
  const headerLabel =
    view === "day"
      ? formatDateLong(anchorDate)
      : view === "week"
        ? formatWeekRange(anchor)
        : anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const viewContent =
    view === "month" ? (
      <MonthView anchorDate={anchorDate} appointments={appointments} onOpenDay={handleOpenDay} />
    ) : view === "week" ? (
      <Swipeable onPrevious={handlePrevious} onNext={handleNext}>
        <WeekView
          anchorDate={anchorDate}
          appointments={appointments}
          onOpenDay={handleOpenDay}
          onSlotClick={handleSlotClick}
          onAppointmentClick={setViewingDetails}
        />
      </Swipeable>
    ) : (
      <Swipeable onPrevious={handlePrevious} onNext={handleNext}>
        <DayView
          date={anchorDate}
          appointments={appointments}
          onSlotClick={handleSlotClick}
          onAppointmentClick={setViewingDetails}
        />
      </Swipeable>
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Schedule</h1>
        <button
          onClick={() => setCreating({ date: anchorDate })}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </div>

      {activeTodayAppointments.length > 0 && (
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">
              Today — {parseIsoDate(today).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <span className="text-xs text-ink-muted">
              {activeTodayAppointments.length} appointment{activeTodayAppointments.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {activeTodayAppointments.slice(0, 5).map((appt) => (
              <button
                key={appt.id}
                onClick={() => setViewingDetails(appt)}
                className="flex items-center gap-2 rounded-lg px-1 py-1 text-left text-sm active:bg-brand-light"
              >
                <span className="font-semibold text-ink">{formatTime(appt.start_time)}</span>
                <span className="text-ink">{appt.customers?.name ?? "Walk-in"}</span>
                <span className="text-ink-muted">— {appt.service}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => goTo(v, anchorDate)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${
                view === v
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-ink-muted"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            aria-label="Previous"
            className="rounded-full p-2 text-ink-muted active:bg-line/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            aria-label="Next"
            className="rounded-full p-2 text-ink-muted active:bg-line/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-ink-muted">{headerLabel}</p>

      {appointments.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card">
          <CalendarDays className="h-6 w-6 shrink-0 text-ink-muted" />
          <div className="flex-1">
            <p className="text-sm text-ink-muted">No appointments scheduled.</p>
          </div>
          <button
            onClick={() => setCreating({ date: anchorDate })}
            className="shrink-0 text-sm font-semibold text-brand"
          >
            + Add your first appointment
          </button>
        </div>
      )}

      <div
        key={`${view}-${anchorDate}`}
        className="schedule-slide-in"
        style={
          {
            "--schedule-slide-from": enterDir === "left" ? "-14px" : enterDir === "right" ? "14px" : "0px",
          } as React.CSSProperties
        }
      >
        {viewContent}
      </div>

      {creating && (
        <AppointmentModal
          customers={customers}
          initialDate={creating.date}
          initialStartTime={creating.startTime}
          initialEndTime={creating.endTime}
          onClose={() => setCreating(null)}
        />
      )}

      {editing && (
        <AppointmentModal
          customers={customers}
          editAppointment={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {viewingDetails && (
        <AppointmentDetails
          appointment={viewingDetails}
          onClose={() => setViewingDetails(null)}
          onEdit={() => {
            setEditing(viewingDetails)
            setViewingDetails(null)
          }}
        />
      )}
    </div>
  )
}

function formatWeekRange(anchor: Date): string {
  const start = startOfWeek(anchor, { weekStartsOn: 0 })
  const end = endOfWeek(anchor, { weekStartsOn: 0 })
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${startLabel} – ${endLabel}`
}
