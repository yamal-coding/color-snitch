import { LABELED_COLORS } from './Colors'

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return [r, g, b]
}

function rgbToLinear(c: number): number {
  const normalized = c / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  // Convert to linear RGB
  const lr = rgbToLinear(r)
  const lg = rgbToLinear(g)
  const lb = rgbToLinear(b)

  // Convert to LMS
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  // Apply cube root
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  // Convert to OKLAB
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  return [L, a, B]
}

function hexToOklab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  return rgbToOklab(r, g, b)
}

function euclideanDistance(color1: [number, number, number], color2: [number, number, number]): number {
  const [L1, a1, b1] = color1
  const [L2, a2, b2] = color2
  return Math.sqrt(Math.pow(L1 - L2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2))
}

export function getColorName(hexColor: string): string {
  const inputOklab = hexToOklab(hexColor)

  let closestColorName = ''
  let minDistance = Infinity

  for (const [colorName, hexColors] of Object.entries(LABELED_COLORS)) {
    for (const hex of hexColors) {
      const colorOklab = hexToOklab(hex)
      const distance = euclideanDistance(inputOklab, colorOklab)

      if (distance < minDistance) {
        minDistance = distance
        closestColorName = colorName
      }
    }
  }

  return closestColorName
}