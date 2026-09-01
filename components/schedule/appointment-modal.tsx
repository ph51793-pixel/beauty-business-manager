"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { X, Search, Plus, UserRound } from "lucide-react"
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  SERVICE_SUGGESTIONS,
  type AppointmentStatus,
} from "@/lib/constants"
import { todayIsoDate } from "@/lib/format"
import {
  createAppointmentAction,
  updateAppointmentAction,
  type ActionState,
} from "@/app/(app)/schedule/actions"
import type { Customer } from "@/lib/data/customers"
import type { AppointmentWithClient } from "@/lib/data/appointments"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  )
}

export function AppointmentModal({
  customers,
  onClose,
  editAppointment,
  initialDate,
  initialStartTime,
  initialEndTime,
}: {
  customers: Customer[]
  onClose: () => void
  editAppointment?: AppointmentWithClient
  initialDate?: string
  initialStartTime?: string
  initialEndTime?: string
}) {
  const isEdit = Boolean(editAppointment)
  const boundAction = isEdit
    ? updateAppointmentAction.bind(null, editAppointment!.id)
    : createAppointmentAction
  const [state, formAction] = useFormState<ActionState, FormData>(boundAction, undefined)

  const [clientQuery, setClientQuery] = useState(editAppointment?.customers?.name ?? "")
  const [selectedClientId, setSelectedClientId] = useState(editAppointment?.client_id ?? "")
  const [showClientList, setShowClientList] = useState(false)
  const [status, setStatus] = useState<AppointmentStatus>(
    (editAppointment?.status as AppointmentStatus) ?? "scheduled"
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowClientList(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!q) return customers.slice(0, 6)
    return customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [customers, clientQuery])

  const exactMatch = customers.some(
    (c) => c.name.toLowerCase() === clientQuery.trim().toLowerCase()
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-sheet sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {isEdit ? "Edit appointment" : "New Appointment"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted active:bg-line/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div ref={containerRef} className="relative">
            <label htmlFor="client" className="mb-1.5 block text-sm font-medium text-ink">
              Client
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="client"
                type="text"
                value={clientQuery}
                onChange={(e) => {
                  setClientQuery(e.target.value)
                  setSelectedClientId("")
                  setShowClientList(true)
                }}
                onFocus={() => setShowClientList(true)}
                placeholder="Search or add a client"
                autoComplete="off"
                className="w-full rounded-xl border border-line bg-paper py-3 pl-10 pr-4 text-base outline-none focus:border-brand"
              />
            </div>
            <input type="hidden" name="client_id" value={selectedClientId} />
            <input
              type="hidden"
              name="new_customer_name"
              value={selectedClientId ? "" : clientQuery}
            />

            {showClientList && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(c.id)
                      setClientQuery(c.name)
                      setShowClientList(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-brand-light"
                  >
                    <UserRound className="h-4 w-4 text-ink-muted" />
                    {c.name}
                  </button>
                ))}
                {clientQuery.trim() && !exactMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientId("")
                      setShowClientList(false)
                    }}
                    className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm font-medium text-brand hover:bg-brand-light"
                  >
                    <Plus className="h-4 w-4" />
                    Add &quot;{clientQuery.trim()}&quot; as new client
                  </button>
                )}
                {!clientQuery.trim() && filteredClients.length === 0 && (
                  <p className="px-4 py-2.5 text-sm text-ink-muted">No clients yet</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-ink">
              Service
            </label>
            <input
              id="service"
              name="service"
              type="text"
              required
              list="service-suggestions"
              defaultValue={editAppointment?.service ?? ""}
              placeholder="e.g. Gel manicure"
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
            <datalist id="service-suggestions">
              {SERVICE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="appointment_date" className="mb-1.5 block text-sm font-medium text-ink">
              Date
            </label>
            <input
              id="appointment_date"
              name="appointment_date"
              type="date"
              required
              defaultValue={editAppointment?.appointment_date ?? initialDate ?? todayIsoDate()}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start_time" className="mb-1.5 block text-sm font-medium text-ink">
                Start time
              </label>
              <input
                id="start_time"
                name="start_time"
                type="time"
                required
                defaultValue={editAppointment?.start_time.slice(0, 5) ?? initialStartTime ?? "09:00"}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="mb-1.5 block text-sm font-medium text-ink">
                End time
              </label>
              <input
                id="end_time"
                name="end_time"
                type="time"
                required
                defaultValue={editAppointment?.end_time.slice(0, 5) ?? initialEndTime ?? "10:00"}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-ink">
              Price <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
              <input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                defaultValue={editAppointment?.price ?? ""}
                placeholder="0.00"
                className="w-full rounded-xl border border-line bg-paper py-3 pl-7 pr-4 text-base outline-none focus:border-brand"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
              <input type="hidden" name="status" value={status} />
              <div className="grid grid-cols-2 gap-2">
                {APPOINTMENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      status === s
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-paper text-ink-muted active:bg-line/50"
                    }`}
                  >
                    {APPOINTMENT_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={editAppointment?.notes ?? ""}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton label={isEdit ? "Save changes" : "Save appointment"} />
        </form>
      </div>
    </div>
  )
}
