"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { todayIsoDate } from "@/lib/format"
import type { ScheduleViewMode } from "./schedule-view"

// The server doesn't know the visitor's local timezone (Vercel runs in UTC), so
// landing on /schedule with no ?date= redirects once to the browser's own local
// "today" instead of guessing server-side — this keeps the calendar's default
// day from drifting a day off near the UTC boundary.
export function RedirectToToday({ view }: { view: ScheduleViewMode }) {
  const router = useRouter()

  useEffect(() => {
    const today = todayIsoDate()
    router.replace(`/schedule?view=${view}&date=${today}&today=${today}`)
  }, [router, view])

  return null
}
