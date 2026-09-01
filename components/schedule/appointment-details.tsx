"use client"

import { useState, useTransition } from "react"
import { X, Pencil, CheckCircle2, Ban, Trash2 } from "lucide-react"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_STYLES,
  type AppointmentStatus,
} from "@/lib/constants"
import { formatCurrency, formatDateLong, formatTime } from "@/lib/format"
import {
  updateAppointmentStatusAction,
  deleteAppointmentAction,
} from "@/app/(app)/schedule/actions"
import type { AppointmentWithClient } from "@/lib/data/appointments"

export function AppointmentDetails({
  appointment,
  onClose,
  onEdit,
}: {
  appointment: AppointmentWithClient
  onClose: () => void
  onEdit: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = appointment.status as AppointmentStatus
  const styles = APPOINTMENT_STATUS_STYLES[status] ?? APPOINTMENT_STATUS_STYLES.scheduled

  function setStatus(next: AppointmentStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointment.id, next)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  function confirmDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAppointmentAction(appointment.id)
      if (result?.error) {
        setError(result.error)
        setConfirmingDelete(false)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-sheet sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {appointment.customers?.name ?? "Walk-in"}
            </h2>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
              {APPOINTMENT_STATUS_LABELS[status]}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted active:bg-line/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="text-ink-muted">Date</p>
            <p className="font-medium text-ink">{formatDateLong(appointment.appointment_date)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Time</p>
            <p className="font-medium text-ink">
              {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">Service</p>
            <p className="font-medium text-ink">{appointment.service}</p>
          </div>
          {appointment.price != null && (
            <div>
              <p className="text-ink-muted">Price</p>
              <p className="font-medium text-ink">{formatCurrency(Number(appointment.price))}</p>
            </div>
          )}
          {appointment.notes && (
            <div>
              <p className="text-ink-muted">Notes</p>
              <p className="font-medium text-ink">{appointment.notes}</p>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {confirmingDelete ? (
          <div className="mt-5 rounded-xl border border-line bg-paper p-3">
            <p className="text-sm font-medium text-ink">
              Are you sure you want to delete this appointment?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-ink active:bg-line/50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {status !== "completed" && (
              <button
                type="button"
                onClick={() => setStatus("completed")}
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-xl bg-success-light py-3 text-sm font-semibold text-success disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Completed
              </button>
            )}
            {status !== "cancelled" && (
              <button
                type="button"
                onClick={() => setStatus("cancelled")}
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-ink-muted disabled:opacity-60"
              >
                <Ban className="h-4 w-4" />
                Cancel Appointment
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-danger disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
