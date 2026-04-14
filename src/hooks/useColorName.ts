import { useState, useCallback } from 'react'
import { getColorName } from '../GetColor'

export interface ColorNameState {
  hexColor: string
  colorName: string
  isLoading: boolean
  setHexColor: (value: string) => void
  handleSubmitFor: (hex: string) => Promise<void>
}

/**
 * Manages the hex color value and the async lookup for a human-readable
 * color name. Keeps UI loading state in sync with the async operation.
 */
export function useColorName(): ColorNameState {
  const [hexColor, setHexColorRaw] = useState('')
  const [colorName, setColorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const setHexColor = useCallback((value: string) => {
    setHexColorRaw(value && !value.startsWith('#') ? `#${value}` : value)
  }, [])

  const handleSubmitFor = useCallback(async (hex: string) => {
    if (!hex.trim()) return

    setIsLoading(true)
    setColorName('')

    try {
      // Artificial delay to show loading state
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      const result = await getColorName(hex)
      setColorName(result)
    } catch (error) {
      console.error('Error getting color name:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { hexColor, colorName, isLoading, setHexColor, handleSubmitFor }
}
