import { useState, useRef } from 'react'
import { styles } from './App.styles'
import { getColorName } from './GetColor'

function View() {
  const [hexColor, setHexColor] = useState('')
  const [colorName, setColorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setColorName('')
    }
  }

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const rect = img.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Get the actual image dimensions
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
    setHexColor(hex.toUpperCase())
  }

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

        <div style={styles.imageUploadContainer}>
          <label htmlFor="image-upload" style={styles.imageUploadLabel}>
            📷 Pick color from image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
          />
        </div>

        {imageUrl && (
          <div style={styles.imageContainer}>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded"
              onClick={handleImageClick}
              style={styles.image}
            />
            <p style={styles.imageHint}>Click on the image to pick a color</p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

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
