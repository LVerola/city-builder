import { describe, expect, it } from 'vitest'
import { RandomGenerator, SEMENTE_PADRAO } from './RandomGenerator'

describe('RandomGenerator', () => {
  it('CA2: seeds diferentes produzem sequências diferentes', () => {
    const a = new RandomGenerator(SEMENTE_PADRAO)
    const b = new RandomGenerator(SEMENTE_PADRAO + 1)
    const sequenciaA = Array.from({ length: 20 }, () => a.proximo())
    const sequenciaB = Array.from({ length: 20 }, () => b.proximo())

    expect(sequenciaA).not.toEqual(sequenciaB)
  })

  it('CA6: proximo fica em [0, 1)', () => {
    const gerador = new RandomGenerator(SEMENTE_PADRAO)

    for (let i = 0; i < 100; i++) {
      const valor = gerador.proximo()
      expect(valor).toBeGreaterThanOrEqual(0)
      expect(valor).toBeLessThan(1)
    }
  })

  it('CA6: proximoInteiro(3, 7) devolve inteiro inclusivo', () => {
    const gerador = new RandomGenerator(SEMENTE_PADRAO)

    for (let i = 0; i < 50; i++) {
      const valor = gerador.proximoInteiro(3, 7)
      expect(Number.isInteger(valor)).toBe(true)
      expect(valor).toBeGreaterThanOrEqual(3)
      expect(valor).toBeLessThanOrEqual(7)
    }
  })

  it('proximoInteiro lança se min > max', () => {
    const gerador = new RandomGenerator(SEMENTE_PADRAO)

    expect(() => gerador.proximoInteiro(7, 3)).toThrow(/Intervalo inválido/)
  })

  it('a mesma seed reproduz a mesma sequência', () => {
    const a = new RandomGenerator(SEMENTE_PADRAO)
    const b = new RandomGenerator(SEMENTE_PADRAO)

    expect(Array.from({ length: 50 }, () => a.proximo())).toEqual(
      Array.from({ length: 50 }, () => b.proximo()),
    )
  })
})
