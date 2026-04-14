import { useState, useRef, useEffect, useCallback } from 'react'
import { VIEWER_HEIGHT } from '../App.styles'
import { averageColor, rgbToHex } from '../averageColor'
import { useZoomPan, type ZoomPanHandlers } from './useZoomPan'

export interface ImageViewerState extends ZoomPanHandlers {
  image: HTMLImageElement | null
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  sampleVisibleArea: () => string | null
  samplePixel: (clientX: number, clientY: number) => string | null
}

/**
 * Manages image loading, offscreen pixel sampling, and visible-canvas
 * rendering for the image viewer. Delegates zoom/pan to useZoomPan.
 */
export function useImageViewer(): ImageViewerState {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const zoomPan = useZoomPan(VIEWER_HEIGHT)
  const { zoom, pan, viewerRef, reset } = zoomPan

  // Redraw the visible canvas whenever the image, zoom, or pan changes.
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const viewer = viewerRef.current
    if (!canvas || !viewer || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = viewer.clientWidth
    canvas.width = width
    canvas.height = VIEWER_HEIGHT

    ctx.clearRect(0, 0, width, VIEWER_HEIGHT)
    ctx.imageSmoothingEnabled = zoom < 4
    ctx.drawImage(image, pan.x, pan.y, image.naturalWidth * zoom, image.naturalHeight * zoom)
  }, [image, zoom, pan, viewerRef])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const img = new Image()
      img.onload = () => {
        setImage(img)
        reset(img.naturalWidth, img.naturalHeight)

        // Build an offscreen canvas for pixel sampling
        const offscreen = document.createElement('canvas')
        offscreen.width = img.naturalWidth
        offscreen.height = img.naturalHeight
        const ctx = offscreen.getContext('2d')
        if (ctx) ctx.drawImage(img, 0, 0)
        offscreenCanvasRef.current = offscreen
      }
      img.src = URL.createObjectURL(file)
    },
    [reset],
  )

  /**
   * Samples the average color of the currently visible image region.
   * Returns the hex string, or null if sampling is not possible.
   */
  const sampleVisibleArea = useCallback((): string | null => {
    const offscreen = offscreenCanvasRef.current
    const viewer = viewerRef.current
    if (!offscreen || !viewer || !image) return null

    const ctx = offscreen.getContext('2d')
    if (!ctx) return null

    const viewerWidth = viewer.clientWidth
    const imgLeft = Math.max(0, Math.round(-pan.x / zoom))
    const imgTop = Math.max(0, Math.round(-pan.y / zoom))
    const imgRight = Math.min(image.naturalWidth, Math.round((viewerWidth - pan.x) / zoom))
    const imgBottom = Math.min(image.naturalHeight, Math.round((VIEWER_HEIGHT - pan.y) / zoom))

    const w = imgRight - imgLeft
    const h = imgBottom - imgTop
    if (w <= 0 || h <= 0) return null

    const imageData = ctx.getImageData(imgLeft, imgTop, w, h)
    const [r, g, b] = averageColor(imageData)
    return rgbToHex(r, g, b)
  }, [image, zoom, pan, viewerRef])

  /**
   * Samples the color of a single pixel at the given client coordinates.
   * Translates client → canvas-local → image coordinates using current zoom/pan.
   * Returns the hex string, or null if sampling is not possible.
   */
  const samplePixel = useCallback((clientX: number, clientY: number): string | null => {
    const offscreen = offscreenCanvasRef.current
    const canvas = canvasRef.current
    if (!offscreen || !canvas || !image) return null

    const ctx = offscreen.getContext('2d')
    if (!ctx) return null

    const rect = canvas.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top

    // Invert the canvas transform: canvasCoord = imgCoord * zoom + pan
    const imgX = Math.round((canvasX - pan.x) / zoom)
    const imgY = Math.round((canvasY - pan.y) / zoom)

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(image.naturalWidth - 1, imgX))
    const clampedY = Math.max(0, Math.min(image.naturalHeight - 1, imgY))

    const { data } = ctx.getImageData(clampedX, clampedY, 1, 1)
    return rgbToHex(data[0], data[1], data[2])
  }, [image, zoom, pan])

  return {
    image,
    canvasRef,
    handleImageUpload,
    sampleVisibleArea,
    samplePixel,
    ...zoomPan,
  }
}
