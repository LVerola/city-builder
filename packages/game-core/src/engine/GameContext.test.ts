import { describe, expect, it } from 'vitest'
import { DT_TICK, GameLoop } from './GameLoop'
import { GameContext, GeradorAusenteError, usarAcaso } from './GameContext'
import { SEMENTE_PADRAO } from './RandomGenerator'

function coletarSequencia(semente: number, ticks: number, amostras: number): number[] {
  const contexto = new GameContext({ semente })
  const loop = new GameLoop({ aoRenderizar: () => undefined })
  for (let i = 0; i < ticks; i++) {
    loop.processarFrame(DT_TICK)
  }
  const gerador = contexto.obterGerador()
  return Array.from({ length: amostras }, () => gerador.proximo())
}

describe('GameContext', () => {
  it('CA1: mesma seed + mesmos ticks reproduzem a sequência', () => {
    const primeira = coletarSequencia(SEMENTE_PADRAO, 100, 50)
    const segunda = coletarSequencia(SEMENTE_PADRAO, 100, 50)

    expect(primeira).toEqual(segunda)
  })

  it('CA4: sessão nova usa a seed 123456', () => {
    const contexto = new GameContext()

    expect(contexto.obterSemente()).toBe(123456)
    expect(contexto.obterGerador().obterSemente()).toBe(123456)
  })

  it('CA4: outra instância com a mesma seed gera a mesma sequência', () => {
    const a = new GameContext()
    const b = new GameContext({ semente: SEMENTE_PADRAO })

    expect(Array.from({ length: 20 }, () => a.obterGerador().proximo())).toEqual(
      Array.from({ length: 20 }, () => b.obterGerador().proximo()),
    )
  })

  it('CA5: sem gerador a engine falha cedo e não usa Math.random', () => {
    const contexto = new GameContext({ semGerador: true })

    expect(() => contexto.obterGerador()).toThrow(GeradorAusenteError)
    expect(() => usarAcaso(contexto)).toThrow(/não configurado/)
  })
})
