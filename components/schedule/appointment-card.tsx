import { APPOINTMENT_STATUS_STYLES, type AppointmentStatus } from "@/lib/constants"
import { formatCurrency, formatTime12h } from "@/lib/format"
import type { AppointmentWithClient } from "@/lib/data/appointments"

/**
 * The single highlighted unit in the calendar: one appointment's own card.
 * Never the day cell, column, or hour row — only this block gets the brand
 * pink background (via APPOINTMENT_STATUS_STYLES), sized/positioned by the
 * caller to match the appointment's real time range.
 */
export function AppointmentCard({
  appointment,
  style,
  dense,
  onClick,
}: {
  appointment: AppointmentWithClient
  style: React.CSSProperties
  dense?: boolean
  onClick: () => void
}) {
  const styles =
    APPOINTMENT_STATUS_STYLES[appointment.status as AppointmentStatus] ??
    APPOINTMENT_STATUS_STYLES.scheduled

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`absolute overflow-hidden rounded-lg text-left shadow-card ${
        dense ? "px-1.5 py-1" : "px-3 py-1.5"
      } ${styles.card}`}
    >
      <p className={`truncate font-bold leading-tight ${dense ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"}`}>
        {formatTime12h(appointment.start_time)}
      </p>
      <p className={`truncate font-bold leading-tight ${dense ? "text-[11px] sm:text-sm" : "text-base sm:text-lg"}`}>
        {appointment.customers?.name ?? "Walk-in"}
      </p>
      {!dense && (
        <p className="truncate text-xs leading-tight opacity-80">
          {appointment.service}
          {appointment.price ? ` · ${formatCurrency(Number(appointment.price))}` : ""}
        </p>
      )}
    </button>
  )
}
