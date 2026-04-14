import { describe, it, expect } from 'vitest'
import { averageColor, rgbToHex } from './averageColor'

/**
 * Creates a mock ImageData-compatible object for testing.
 * The real ImageData constructor is a browser API not available in Node.
 */
function makeImageData(
  pixels: [number, number, number][],
  width: number,
): ImageData {
  const height = pixels.length / width
  const data = new Uint8ClampedArray(pixels.length * 4)
  for (let i = 0; i < pixels.length; i++) {
    data[i * 4] = pixels[i][0]
    data[i * 4 + 1] = pixels[i][1]
    data[i * 4 + 2] = pixels[i][2]
    data[i * 4 + 3] = 255 // alpha
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

describe('averageColor', () => {
  it('should return the same color for uniform pixels', () => {
    const pixels: [number, number, number][] = Array(9).fill([120, 80, 200])
    const result = averageColor(makeImageData(pixels, 3))
    expect(result).toEqual([120, 80, 200])
  })

  it('should average mixed pixel values', () => {
    const pixels: [number, number, number][] = [
      [0, 0, 0],
      [100, 100, 100],
      [200, 200, 200],
      [255, 255, 255],
    ]
    // Mean: R=(0+100+200+255)/4=138.75 -> 139, same for G, B
    const result = averageColor(makeImageData(pixels, 2))
    expect(result).toEqual([139, 139, 139])
  })

  it('should work with a single pixel (1x1 region)', () => {
    const pixels: [number, number, number][] = [[42, 128, 255]]
    const result = averageColor(makeImageData(pixels, 1))
    expect(result).toEqual([42, 128, 255])
  })

  it('should average different channels independently', () => {
    const pixels: [number, number, number][] = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [0, 0, 0],
    ]
    // R: (255+0+0+0)/4=63.75 -> 64
    // G: (0+255+0+0)/4=63.75 -> 64
    // B: (0+0+255+0)/4=63.75 -> 64
    const result = averageColor(makeImageData(pixels, 2))
    expect(result).toEqual([64, 64, 64])
  })

  it('should return [0, 0, 0] for all-black pixels', () => {
    const pixels: [number, number, number][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const result = averageColor(makeImageData(pixels, 2))
    expect(result).toEqual([0, 0, 0])
  })
})

describe('rgbToHex', () => {
  it('should convert RGB to uppercase hex string', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000')
    expect(rgbToHex(0, 255, 0)).toBe('#00FF00')
    expect(rgbToHex(0, 0, 255)).toBe('#0000FF')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF')
  })

  it('should pad single-digit hex values with zero', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203')
    expect(rgbToHex(15, 15, 15)).toBe('#0F0F0F')
  })
})
