"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { signInAction } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  const [state, formAction] = useFormState(signInAction, undefined)

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Sign in to your business account.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={searchParams?.redirectTo ?? "/dashboard"} />
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
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
          />
        </div>

        {state?.error && <p className="text-sm text-danger">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand">
          Create an account
        </Link>
      </p>
    </div>
  )
}
