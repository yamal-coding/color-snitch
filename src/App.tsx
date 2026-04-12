import { useState, useRef, useEffect, useCallback } from 'react'
import { styles, VIEWER_HEIGHT } from './App.styles'
import { getColorName } from './GetColor'
import { averageColor, rgbToHex } from './averageColor'

function View() {
  const [hexColor, setHexColor] = useState('')
  const [colorName, setColorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Zoom & pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  const viewerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const getViewerWidth = useCallback(() => {
    return viewerRef.current?.clientWidth ?? 400
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setColorName('')
        setHexColor('')

        // Fit image into viewer by default
        const viewerWidth = getViewerWidth()
        const scaleX = viewerWidth / img.naturalWidth
        const scaleY = VIEWER_HEIGHT / img.naturalHeight
        const fitZoom = Math.min(scaleX, scaleY)
        setZoom(fitZoom)

        // Center the image
        setPan({
          x: (viewerWidth - img.naturalWidth * fitZoom) / 2,
          y: (VIEWER_HEIGHT - img.naturalHeight * fitZoom) / 2,
        })

        // Create offscreen canvas for pixel sampling
        const offscreen = document.createElement('canvas')
        offscreen.width = img.naturalWidth
        offscreen.height = img.naturalHeight
        const ctx = offscreen.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
        }
        offscreenCanvasRef.current = offscreen
      }
      img.src = URL.createObjectURL(file)
    }
  }

  // Draw the image on the visible canvas with current zoom/pan
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const viewer = viewerRef.current
    if (!canvas || !viewer || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = viewer.clientWidth
    const height = VIEWER_HEIGHT
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = zoom < 4
    ctx.drawImage(
      image,
      pan.x,
      pan.y,
      image.naturalWidth * zoom,
      image.naturalHeight * zoom,
    )
  }, [image, zoom, pan])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse wheel zoom (zoom toward pointer)
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault()
      if (!image || !viewerRef.current) return

      const rect = viewerRef.current.getBoundingClientRect()
      const pointerX = event.clientX - rect.left
      const pointerY = event.clientY - rect.top

      const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15
      const newZoom = Math.max(0.1, Math.min(zoom * zoomFactor, 50))

      // Adjust pan so the point under the cursor stays fixed
      const newPanX = pointerX - (pointerX - pan.x) * (newZoom / zoom)
      const newPanY = pointerY - (pointerY - pan.y) * (newZoom / zoom)

      setZoom(newZoom)
      setPan({ x: newPanX, y: newPanY })
    },
    [image, zoom, pan],
  )

  // Drag to pan
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!image) return
      setIsDragging(true)
      dragStart.current = { x: event.clientX, y: event.clientY }
      panStart.current = { x: pan.x, y: pan.y }
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
    },
    [image, pan],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging) return
      const dx = event.clientX - dragStart.current.x
      const dy = event.clientY - dragStart.current.y
      setPan({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      })
    },
    [isDragging],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Sample the entire visible frame area
  const handleSampleArea = useCallback(() => {
    const offscreen = offscreenCanvasRef.current
    const viewer = viewerRef.current
    if (!offscreen || !viewer || !image) return

    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    const viewerWidth = viewer.clientWidth

    // Map the four corners of the viewer to image coordinates
    const imgLeft = Math.max(0, Math.round(-pan.x / zoom))
    const imgTop = Math.max(0, Math.round(-pan.y / zoom))
    const imgRight = Math.min(
      image.naturalWidth,
      Math.round((viewerWidth - pan.x) / zoom),
    )
    const imgBottom = Math.min(
      image.naturalHeight,
      Math.round((VIEWER_HEIGHT - pan.y) / zoom),
    )

    const w = imgRight - imgLeft
    const h = imgBottom - imgTop

    if (w <= 0 || h <= 0) return

    const imageData = ctx.getImageData(imgLeft, imgTop, w, h)
    const [r, g, b] = averageColor(imageData)
    setHexColor(rgbToHex(r, g, b))
  }, [image, zoom, pan])

  const handleSubmit = async () => {
    if (!hexColor.trim()) return

    setIsLoading(true)
    setColorName('')

    try {
      // Artificial delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
      const result = await getColorName(hexColor)
      setColorName(result)
    } catch (error) {
      console.error('Error getting color name:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <form
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <h1 style={styles.title}>What's the name of this color?</h1>

        <div style={styles.imageUploadContainer}>
          <label htmlFor="image-upload" style={styles.imageUploadLabel}>
            Pick color from image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
          />
        </div>

        {image && (
          <>
            <p style={styles.viewerHint}>
              Scroll to zoom, drag to pan. Everything inside the frame is
              scanned.
            </p>
            <div
              ref={viewerRef}
              style={{
                ...styles.imageViewerContainer,
                ...(isDragging ? styles.imageViewerContainerGrabbing : {}),
              }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <canvas ref={canvasRef} style={styles.viewerCanvas} />
            </div>
            <button
              type="button"
              onClick={handleSampleArea}
              style={styles.sampleButton}
            >
              Scan area
            </button>
          </>
        )}

        <div style={styles.inputWithPreview}>
          {hexColor && (
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                backgroundColor: hexColor,
              }}
              title={hexColor}
            />
          )}
          <input
            type="text"
            placeholder="Hex color (e.g.: #FF5733)"
            value={hexColor}
            onChange={(e) => {
              const value = e.target.value
              setHexColor(value && !value.startsWith('#') ? `#${value}` : value)
            }}
            disabled={isLoading}
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Loading...' : 'Get color name'}
        </button>
        {colorName && !isLoading && (
          <p style={styles.result}>Color name: {colorName}</p>
        )}
      </form>
    </div>
  )
}

function App() {
  return <View />
}

export default App
