"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { X } from "lucide-react"
import { addCustomerAction, updateCustomerAction, type ActionState } from "@/app/(app)/actions"
import type { Customer } from "@/lib/data/customers"

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

export function CustomerFormSheet({
  customer,
  onClose,
}: {
  customer?: Customer
  onClose: () => void
}) {
  const isEdit = Boolean(customer)
  const boundAction = isEdit ? updateCustomerAction.bind(null, customer!.id) : addCustomerAction
  const [state, formAction] = useFormState<ActionState, FormData>(boundAction, undefined)

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-sheet sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {isEdit ? "Edit customer" : "Add customer"}
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
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={customer?.name ?? ""}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
              Phone <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={customer?.phone ?? ""}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email ?? ""}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={customer?.notes ?? ""}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton label={isEdit ? "Save changes" : "Add customer"} />
        </form>
      </div>
    </div>
  )
}
