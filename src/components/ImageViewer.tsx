import { styles } from '../App.styles'
import type { ImageViewerState } from '../hooks/useImageViewer'

interface ImageViewerProps {
  viewer: ImageViewerState
  onScan: () => void
}

/**
 * Renders the zoomable/pannable canvas viewer, a usage hint, and the
 * "Scan area" trigger. All interaction state lives in the passed hook value.
 */
export function ImageViewer({ viewer, onScan }: ImageViewerProps) {
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
      <button type="button" onClick={onScan} style={styles.sampleButton}>
        Scan area
      </button>
    </>
  )
}
