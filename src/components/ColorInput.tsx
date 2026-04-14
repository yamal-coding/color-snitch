import { styles } from '../App.styles'
import type { ColorNameState } from '../hooks/useColorName'

interface ColorInputProps {
  state: ColorNameState
}

/**
 * Renders the hex color text input with an inline color swatch preview,
 * the submit button, and the resolved color name result.
 */
export function ColorInput({ state }: ColorInputProps) {
  const { hexColor, colorName, isLoading, setHexColor, handleSubmit } = state

  return (
    <>
      <div style={styles.inputWithPreview}>
        {hexColor && (
          <div
            style={{ ...styles.colorSwatch, backgroundColor: hexColor }}
            title={hexColor}
          />
        )}
        <input
          type="text"
          placeholder="Hex color (e.g.: #FF5733)"
          value={hexColor}
          onChange={(e) => setHexColor(e.target.value)}
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
    </>
  )
}
