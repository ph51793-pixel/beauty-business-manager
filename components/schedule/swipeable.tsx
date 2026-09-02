"use client"

import { useEffect, useRef, useState } from "react"

const SWIPE_THRESHOLD = 64
const DRAG_RESISTANCE = 0.55
const WHEEL_THRESHOLD = 28
const WHEEL_COOLDOWN_MS = 450

/**
 * Wraps calendar content with horizontal swipe/drag navigation (touch, mouse
 * drag, and trackpad horizontal scroll) while leaving native vertical
 * scrolling untouched. Only reacts when the gesture is clearly horizontal
 * (|dx| > |dy|), so it never fights the page's vertical scroll or a tap on an
 * appointment card. Left/Right arrow keys provide the same navigation for
 * keyboard/desktop use.
 */
export function Swipeable({
  onPrevious,
  onNext,
  className,
  children,
}: {
  onPrevious: () => void
  onNext: () => void
  className?: string
  children: React.ReactNode
}) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const horizontalRef = useRef(false)
  const wheelLockRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return
    startRef.current = { x: e.clientX, y: e.clientY }
    draggingRef.current = true
    horizontalRef.current = false
    setIsDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y

    if (!horizontalRef.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      horizontalRef.current = Math.abs(dx) > Math.abs(dy)
      if (!horizontalRef.current) return
      // Only capture once a horizontal drag is confirmed, so a plain tap on
      // a card/button never gets its click event hijacked by the wrapper.
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }

    setDragX(dx * DRAG_RESISTANCE)
  }

  function endDrag(e: React.PointerEvent) {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const dx = startRef.current ? e.clientX - startRef.current.x : 0
    startRef.current = null

    if (horizontalRef.current && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) onNext()
      else onPrevious()
    }
    setDragX(0)
    horizontalRef.current = false
  }

  function onWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) < WHEEL_THRESHOLD || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
    if (wheelLockRef.current) return
    wheelLockRef.current = true
    if (e.deltaX > 0) onNext()
    else onPrevious()
    setTimeout(() => {
      wheelLockRef.current = false
    }, WHEEL_COOLDOWN_MS)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return
      }
      if (!containerRef.current) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        onPrevious()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onPrevious, onNext])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        touchAction: "pan-y",
        transform: dragX ? `translateX(${dragX}px)` : undefined,
        transition: isDragging ? "none" : "transform 200ms ease",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
    >
      {children}
    </div>
  )
}
