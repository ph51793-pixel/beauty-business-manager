"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { todayIsoDate } from "@/lib/format"

// The server (Vercel) runs in UTC, which can already be "tomorrow" while it's
// still "today" for the owner locally. Landing on a money page with no
// ?today= redirects once to the browser's own local today instead of
// guessing server-side, so revenue never gets bucketed into the wrong day —
// the same pattern already shipped and verified for Schedule.
export function LocalTodayRedirect({
  basePath,
  extraParams,
}: {
  basePath: string
  extraParams?: Record<string, string>
}) {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(extraParams)
    params.set("today", todayIsoDate())
    router.replace(`${basePath}?${params.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
