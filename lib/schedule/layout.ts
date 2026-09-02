import { timeToMinutes } from "./time"

export type PositionedAppointment<T> = {
  appt: T
  top: number
  height: number
  left: number
  width: number
}

type TimedAppointment = { start_time: string; end_time: string }

/**
 * Positions a single day's appointments on a vertical time axis, pixel-accurate
 * to their start/end time, and lays overlapping appointments out side-by-side
 * (Google-Calendar-style greedy column assignment) instead of stacking them.
 */
export function layoutDayAppointments<T extends TimedAppointment>(
  appointments: T[],
  rangeStartMinutes: number,
  rangeEndMinutes: number,
  pxPerMinute: number,
  minHeight = 40
): PositionedAppointment<T>[] {
  const sorted = [...appointments].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  )
  const result: PositionedAppointment<T>[] = []

  let cluster: T[] = []
  let clusterEnd = -Infinity

  function flushCluster() {
    if (cluster.length === 0) return

    const columnEnds: number[] = []
    const columnOf = new Map<number, number>()

    cluster.forEach((appt, idx) => {
      const start = timeToMinutes(appt.start_time)
      const end = timeToMinutes(appt.end_time)
      let placedColumn = -1
      for (let c = 0; c < columnEnds.length; c++) {
        if (columnEnds[c] <= start) {
          placedColumn = c
          break
        }
      }
      if (placedColumn === -1) {
        placedColumn = columnEnds.length
        columnEnds.push(end)
      } else {
        columnEnds[placedColumn] = end
      }
      columnOf.set(idx, placedColumn)
    })

    const totalColumns = columnEnds.length
    cluster.forEach((appt, idx) => {
      const start = Math.max(rangeStartMinutes, timeToMinutes(appt.start_time))
      const end = Math.min(rangeEndMinutes, timeToMinutes(appt.end_time))
      const top = (start - rangeStartMinutes) * pxPerMinute
      const height = Math.max(minHeight, (end - start) * pxPerMinute - 2)
      const width = 100 / totalColumns
      const left = (columnOf.get(idx) ?? 0) * width
      result.push({ appt, top, height, left, width })
    })

    cluster = []
    clusterEnd = -Infinity
  }

  for (const appt of sorted) {
    const start = timeToMinutes(appt.start_time)
    const end = timeToMinutes(appt.end_time)
    if (cluster.length === 0 || start < clusterEnd) {
      cluster.push(appt)
      clusterEnd = Math.max(clusterEnd, end)
    } else {
      flushCluster()
      cluster.push(appt)
      clusterEnd = end
    }
  }
  flushCluster()

  return result
}
