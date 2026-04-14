/**
 * Computes the average RGB color from an ImageData object.
 * Ignores the alpha channel.
 */
export function averageColor(imageData: ImageData): [number, number, number] {
  const { data, width, height } = imageData
  const pixelCount = width * height

  if (pixelCount === 0) {
    return [0, 0, 0]
  }

  let totalR = 0
  let totalG = 0
  let totalB = 0

  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i]
    totalG += data[i + 1]
    totalB += data[i + 2]
  }

  return [
    Math.round(totalR / pixelCount),
    Math.round(totalG / pixelCount),
    Math.round(totalB / pixelCount),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
}
