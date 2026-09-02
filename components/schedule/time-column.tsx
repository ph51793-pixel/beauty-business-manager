import { formatTime12h } from "@/lib/format"
import { minutesToTime } from "@/lib/schedule/time"

export function TimeColumn({
  businessStart,
  businessEnd,
  slotMinutes,
  slotHeight,
}: {
  businessStart: number
  businessEnd: number
  slotMinutes: number
  slotHeight: number
}) {
  const slotCount = ((businessEnd - businessStart) * 60) / slotMinutes

  return (
    <div className="w-14 shrink-0 sm:w-16">
      {Array.from({ length: slotCount }, (_, i) => {
        const minutes = businessStart * 60 + i * slotMinutes
        const isHour = minutes % 60 === 0
        return (
          <div
            key={i}
            style={{ height: slotHeight }}
            className="border-t border-line/70 pr-1.5 pt-0.5 text-right text-[11px] font-semibold text-ink-muted sm:pr-2 sm:text-sm"
          >
            {isHour ? formatTime12h(minutesToTime(minutes)) : ""}
          </div>
        )
      })}
    </div>
  )
}
