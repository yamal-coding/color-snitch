import { styles } from '../App.styles'
import type { ColorNameState } from '../hooks/useColorName'

interface ColorInputProps {
  state: ColorNameState
}

/**
 * Renders the unified color result: a color swatch, hex code, and resolved
 * color name displayed together in a single label. Shows a shimmer skeleton
 * while loading. Only shown when a hex color has been set.
 */
export function ColorInput({ state }: ColorInputProps) {
  const { hexColor, colorName, isLoading } = state

  if (!hexColor) return null

  if (isLoading) {
    return (
      <div style={styles.colorResultSkeleton}>
        <div style={styles.skeletonSwatch} />
        <div style={styles.skeletonLines}>
          <div style={styles.skeletonLineShort} />
          <div style={styles.skeletonLineLong} />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.colorResult}>
      <div
        style={{ ...styles.colorResultSwatch, backgroundColor: hexColor }}
        title={hexColor}
      />
      <div style={styles.colorResultText}>
        <span style={styles.colorResultHex}>{hexColor.toUpperCase()}</span>
        {colorName && (
          <span style={styles.colorResultName}>{colorName}</span>
        )}
      </div>
    </div>
  )
}
