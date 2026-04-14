import { styles } from './App.styles'
import { useImageViewer } from './hooks/useImageViewer'
import { useColorName } from './hooks/useColorName'
import { ImageViewer } from './components/ImageViewer'
import { ColorInput } from './components/ColorInput'

function App() {
  const viewer = useImageViewer()
  const colorName = useColorName()

  const handleScanAndGetColor = async () => {
    const hex = viewer.sampleVisibleArea()
    if (hex) {
      colorName.setHexColor(hex)
      await colorName.handleSubmitFor(hex)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.form}>
        <h1 style={styles.title}>What's the name of this color?</h1>

        <div style={styles.imageUploadContainer}>
          <label htmlFor="image-upload" style={styles.imageUploadLabel}>
            Pick color from image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={viewer.handleImageUpload}
            style={styles.fileInput}
          />
        </div>

        {viewer.image && (
          <>
            <ImageViewer viewer={viewer} />
            <button
              type="button"
              onClick={handleScanAndGetColor}
              disabled={colorName.isLoading}
              style={styles.button}
            >
              {colorName.isLoading ? 'Loading...' : 'Scan and get average color name'}
            </button>
          </>
        )}

        <ColorInput state={colorName} />
      </div>
    </div>
  )
}

export default App
