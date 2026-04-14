import { styles } from '../App.styles'
import type { ImageViewerState } from '../hooks/useImageViewer'

interface ImageViewerProps {
  viewer: ImageViewerState
  onPixelClick?: (clientX: number, clientY: number) => void
}

/**
 * Renders the zoomable/pannable canvas viewer and a usage hint.
 * All interaction state lives in the passed hook value.
 *
 * When `onPixelClick` is provided (pixel mode), pointer-up events that
 * were not preceded by significant movement are treated as pixel picks.
 */
export function ImageViewer({ viewer, onPixelClick }: ImageViewerProps) {
  const {
    isDragging,
    wasDrag,
    viewerRef,
    canvasRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = viewer

  const handlePointerUpWithPixelPick = (event: React.PointerEvent) => {
    handlePointerUp(event)
    if (onPixelClick && !wasDrag()) {
      onPixelClick(event.clientX, event.clientY)
    }
  }

  const cursorStyle = onPixelClick
    ? { cursor: isDragging ? 'grabbing' : 'crosshair' }
    : isDragging
      ? styles.imageViewerContainerGrabbing
      : {}

  const hintText = onPixelClick
    ? 'Click a pixel to get its color. Drag to pan, scroll to zoom.'
    : 'Scroll or pinch to zoom, drag to pan. Everything inside the frame is scanned.'

  return (
    <>
      <p style={styles.viewerHint}>{hintText}</p>
      <div
        ref={viewerRef}
        style={{
          ...styles.imageViewerContainer,
          ...cursorStyle,
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpWithPixelPick}
        onPointerCancel={handlePointerCancel}
      >
        <canvas ref={canvasRef} style={styles.viewerCanvas} />
      </div>
    </>
  )
}
