import { useState, useRef, useEffect, useCallback } from 'react'

export interface Pan {
  x: number
  y: number
}

export interface ZoomPanHandlers {
  zoom: number
  pan: Pan
  isDragging: boolean
  viewerRef: React.RefObject<HTMLDivElement>
  reset: (naturalWidth: number, naturalHeight: number) => void
  handleWheel: (event: React.WheelEvent) => void
  handlePointerDown: (event: React.PointerEvent) => void
  handlePointerMove: (event: React.PointerEvent) => void
  handlePointerUp: (event: React.PointerEvent) => void
  handlePointerCancel: (event: React.PointerEvent) => void
}

const VIEWER_HEIGHT_FALLBACK = 350

/**
 * Manages zoom, pan, and touch/pointer interaction for an image viewer.
 * Supports mouse-wheel zoom (anchored to cursor), single-finger pan,
 * and two-finger pinch-to-zoom.
 */
export function useZoomPan(viewerHeight: number = VIEWER_HEIGHT_FALLBACK): ZoomPanHandlers {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const viewerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const lastPinchDistance = useRef<number | null>(null)

  // Keep refs in sync so pointer handlers can read latest values without
  // declaring them as dependencies (avoids stale-closure issues).
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])

  /** Fit-and-centre an image inside the viewer on first load. */
  const reset = useCallback((naturalWidth: number, naturalHeight: number) => {
    const viewerWidth = viewerRef.current?.clientWidth ?? 400
    const scaleX = viewerWidth / naturalWidth
    const scaleY = viewerHeight / naturalHeight
    const fitZoom = Math.min(scaleX, scaleY)
    setZoom(fitZoom)
    setPan({
      x: (viewerWidth - naturalWidth * fitZoom) / 2,
      y: (viewerHeight - naturalHeight * fitZoom) / 2,
    })
  }, [viewerHeight])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    if (!viewerRef.current) return

    const rect = viewerRef.current.getBoundingClientRect()
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top

    const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15
    const currentZoom = zoomRef.current
    const currentPan = panRef.current
    const newZoom = Math.max(0.1, Math.min(currentZoom * zoomFactor, 50))

    setZoom(newZoom)
    setPan({
      x: pointerX - (pointerX - currentPan.x) * (newZoom / currentZoom),
      y: pointerY - (pointerY - currentPan.y) * (newZoom / currentZoom),
    })
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (activePointers.current.size === 1) {
      setIsDragging(true)
      dragStart.current = { x: event.clientX, y: event.clientY }
      panStart.current = { x: panRef.current.x, y: panRef.current.y }
    } else {
      setIsDragging(false)
      lastPinchDistance.current = null
    }
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const pointers = Array.from(activePointers.current.values())

    if (pointers.length === 2) {
      const [a, b] = pointers
      const distance = Math.hypot(b.x - a.x, b.y - a.y)

      if (lastPinchDistance.current !== null) {
        const currentZoom = zoomRef.current
        const currentPan = panRef.current
        const zoomFactor = distance / lastPinchDistance.current
        const newZoom = Math.max(0.1, Math.min(currentZoom * zoomFactor, 50))

        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        const rect = viewerRef.current?.getBoundingClientRect()
        const localMidX = midX - (rect?.left ?? 0)
        const localMidY = midY - (rect?.top ?? 0)

        setZoom(newZoom)
        setPan({
          x: localMidX - (localMidX - currentPan.x) * (newZoom / currentZoom),
          y: localMidY - (localMidY - currentPan.y) * (newZoom / currentZoom),
        })
      }

      lastPinchDistance.current = distance
    } else if (pointers.length === 1) {
      if (!isDragging) return
      setPan({
        x: panStart.current.x + (event.clientX - dragStart.current.x),
        y: panStart.current.y + (event.clientY - dragStart.current.y),
      })
    }
  }, [isDragging])

  const releasePointer = useCallback((event: React.PointerEvent) => {
    activePointers.current.delete(event.pointerId)
    lastPinchDistance.current = null

    if (activePointers.current.size === 1) {
      const [remaining] = Array.from(activePointers.current.entries())
      dragStart.current = { x: remaining[1].x, y: remaining[1].y }
      panStart.current = { x: panRef.current.x, y: panRef.current.y }
      setIsDragging(true)
    } else {
      setIsDragging(false)
    }
  }, [])

  return {
    zoom,
    pan,
    isDragging,
    viewerRef,
    reset,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: releasePointer,
    handlePointerCancel: releasePointer,
  }
}
