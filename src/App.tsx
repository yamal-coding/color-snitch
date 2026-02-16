import { useState } from 'react'
import { styles } from './App.styles'
import { getColorName } from './GetColor'

function View() {
  const [hexColor, setHexColor] = useState('')
  const [colorName, setColorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!hexColor.trim()) return
    
    setIsLoading(true)
    setColorName('')
    
    try {
      // Artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
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
        <input
          type="text"
          placeholder="Hex color (e.g.: #FF5733)"
          value={hexColor}
          onChange={(e) => setHexColor(e.target.value)}
          disabled={isLoading}
          style={styles.input}
        />
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Loading...' : 'Submit'}
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
