"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { MailCheck } from "lucide-react"
import { signUpAction } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  )
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUpAction, undefined)

  if (state?.needsEmailConfirmation) {
    return (
      <div className="flex flex-col items-center text-center">
        <MailCheck className="h-10 w-10 text-brand" />
        <h1 className="mt-3 text-xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We sent you a confirmation link. Confirm your email, then sign in below.
        </p>
        <Link
          href="/login"
          className="mt-6 w-full rounded-xl bg-brand py-3.5 text-center text-base font-semibold text-white"
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">Start tracking your business in seconds.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-ink">
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Maria's Nails"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          />
        </div>

        {state?.error && <p className="text-sm text-danger">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </div>
  )
}
