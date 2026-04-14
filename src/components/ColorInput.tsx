import { styles } from '../App.styles'
import type { ColorNameState } from '../hooks/useColorName'

interface ColorInputProps {
  state: ColorNameState
}

/**
 * Renders the unified color result: a color swatch, hex code, and resolved
 * color name displayed together in a single label. Only shown when a result
 * is available.
 */
export function ColorInput({ state }: ColorInputProps) {
  const { hexColor, colorName, isLoading } = state

  if (!hexColor || isLoading) return null

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
