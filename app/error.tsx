"use client"

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-ink">Something went wrong</p>
      <p className="text-sm text-ink-muted">
        Please try again. If this keeps happening, come back in a moment.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  )
}
