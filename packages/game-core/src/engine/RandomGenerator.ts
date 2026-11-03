export const SEMENTE_PADRAO = 123456

export class RandomGenerator {
  private estado: number
  private readonly semente: number

  constructor(semente: number) {
    this.semente = semente >>> 0
    this.estado = this.semente
  }

  proximo(): number {
    // ponytail: mulberry32; trocar só se um teste de qualidade estatística falhar
    this.estado = (this.estado + 0x6d2b79f5) >>> 0
    let t = this.estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  proximoInteiro(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('proximoInteiro exige min e max inteiros')
    }
    if (min > max) {
      throw new Error(`Intervalo inválido: min (${min}) é maior que max (${max})`)
    }
    const amplitude = max - min + 1
    return min + Math.floor(this.proximo() * amplitude)
  }

  obterSemente(): number {
    return this.semente
  }
}
