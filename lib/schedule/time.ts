import { formatISO } from "date-fns"

export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function toIso(date: Date): string {
  return formatISO(date, { representation: "date" })
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function hourLabel(hour: number): string {
  return `${hour % 12 === 0 ? 12 : hour % 12}${hour >= 12 ? "PM" : "AM"}`
}
