import { describe, it, expect } from 'vitest'
import { getColorName } from './GetColor'
import { LABELED_COLORS } from './Colors'

async function expectColorName(colors: readonly string[], expectedName: string) {
  for (const color of colors) {
    const result = await getColorName(color)
    expect(result).toBe(expectedName)
  }
}

describe('getColorName', () => {
  it('should return BLACK', async () => {
    await expectColorName(LABELED_COLORS.BLACK, 'BLACK')
  })

  it('should return WHITE', async () => {
    await expectColorName(LABELED_COLORS.WHITE, 'WHITE')
  })

  it('should return GRAY', async () => {
    await expectColorName(LABELED_COLORS.GRAY, 'GRAY')
  })

  it('should return RED', async () => {
    await expectColorName(LABELED_COLORS.RED, 'RED')
  })

  it('should return GREEN', async () => {
    await expectColorName(LABELED_COLORS.GREEN, 'GREEN')
  })

  it('should return ORANGE', async () => {
    await expectColorName(LABELED_COLORS.ORANGE, 'ORANGE')
  })

  it('should return YELLOW', async () => {
    await expectColorName(LABELED_COLORS.YELLOW, 'YELLOW')
  })

  it('should return BLUE', async () => {
    await expectColorName(LABELED_COLORS.BLUE, 'BLUE')
  })

  it('should return PURPLE', async () => {
    await expectColorName(LABELED_COLORS.PURPLE, 'PURPLE')
  })

  it('should return PINK', async () => {
    await expectColorName(LABELED_COLORS.PINK, 'PINK')
  })

  it('should return BROWN', async () => {
    await expectColorName(LABELED_COLORS.BROWN, 'BROWN')
  })
})
