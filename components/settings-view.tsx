"use client"

import { useFormState, useFormStatus } from "react-dom"
import { LogOut } from "lucide-react"
import { updateBusinessProfileAction, signOutAction, type ActionState } from "@/app/(app)/actions"
import { INDUSTRIES, INDUSTRY_LABELS, type Industry } from "@/lib/constants"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  )
}

export function SettingsView({
  email,
  businessName,
  industry,
}: {
  email: string
  businessName: string | null
  industry: string
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(
    updateBusinessProfileAction,
    undefined
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>

      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <p className="text-sm font-medium text-ink-muted">Signed in as</p>
        <p className="mt-0.5 font-medium text-ink">{email}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink-muted">Business profile</h2>
        <div>
          <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-ink">
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            defaultValue={businessName ?? ""}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-ink">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            defaultValue={industry}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          >
            {INDUSTRIES.map((ind: Industry) => (
              <option key={ind} value={ind}>
                {INDUSTRY_LABELS[ind]}
              </option>
            ))}
          </select>
        </div>

        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.success && <p className="text-sm text-success">Saved.</p>}

        <SaveButton />
      </form>

      <form action={signOutAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3.5 text-base font-semibold text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  )
}
