import { styles } from '../App.styles'
import type { ImageViewerState } from '../hooks/useImageViewer'

interface ImageViewerProps {
  viewer: ImageViewerState
}

/**
 * Renders the zoomable/pannable canvas viewer and a usage hint.
 * All interaction state lives in the passed hook value.
 */
export function ImageViewer({ viewer }: ImageViewerProps) {
  const {
    isDragging,
    viewerRef,
    canvasRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = viewer

  return (
    <>
      <p style={styles.viewerHint}>
        Scroll or pinch to zoom, drag to pan. Everything inside the frame is scanned.
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
        onPointerCancel={handlePointerCancel}
      >
        <canvas ref={canvasRef} style={styles.viewerCanvas} />
      </div>
    </>
  )
}
