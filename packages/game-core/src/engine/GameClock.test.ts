import { describe, expect, it } from 'vitest'
import { DT_TICK, GameLoop, TICKS_POR_SEGUNDO } from './GameLoop'
import { GameClock, TICKS_POR_HORA, formatarDataDoJogo } from './GameClock'

function avancarTicks(relogio: GameClock, quantidade: number): void {
  for (let i = 0; i < quantidade; i++) {
    relogio.avancarTick()
  }
}

describe('GameClock', () => {
  it('CA1: 20 ticks a 1× avançam uma hora', () => {
    const relogio = new GameClock()

    avancarTicks(relogio, TICKS_POR_HORA)

    expect(relogio.obterData()).toEqual({ year: 1, month: 1, day: 1, hour: 1 })
  })

  it('CA7: 23h + 20 ticks vira o dia', () => {
    const relogio = new GameClock({ hour: 23 })

    avancarTicks(relogio, TICKS_POR_HORA)

    expect(relogio.obterData()).toEqual({ year: 1, month: 1, day: 2, hour: 0 })
  })

  it('CA7: dia 30 + 20 ticks vira o mês de 30 dias', () => {
    const relogio = new GameClock({ day: 30, hour: 23 })

    avancarTicks(relogio, TICKS_POR_HORA)

    expect(relogio.obterData()).toEqual({ year: 1, month: 2, day: 1, hour: 0 })
  })

  it('dezembro dia 30 23h vira o ano', () => {
    const relogio = new GameClock({ month: 12, day: 30, hour: 23 })

    avancarTicks(relogio, TICKS_POR_HORA)

    expect(relogio.obterData()).toEqual({ year: 2, month: 1, day: 1, hour: 0 })
  })

  it('obterData devolve cópia', () => {
    const relogio = new GameClock()
    const data = relogio.obterData()
    data.hour = 9

    expect(relogio.obterData().hour).toBe(0)
  })

  it('formatarDataDoJogo usa PT-BR', () => {
    expect(formatarDataDoJogo({ year: 1, month: 1, day: 1, hour: 0 })).toBe(
      'Ano 1 · 1 jan · 00h',
    )
  })

  it('pausa no GameLoop não avança o calendário', () => {
    const relogio = new GameClock()
    const loop = new GameLoop({
      aoRenderizar: () => undefined,
      aoTick: () => relogio.avancarTick(),
    })

    loop.definirVelocidade(0)
    for (let i = 0; i < TICKS_POR_SEGUNDO; i++) {
      loop.processarFrame(DT_TICK)
    }

    expect(relogio.obterData()).toEqual({ year: 1, month: 1, day: 1, hour: 0 })
  })

  it('CA3: 1s real a 2× avança o dobro das horas de 1×', () => {
    const relogio1x = new GameClock()
    const relogio2x = new GameClock()
    const loop1x = new GameLoop({
      aoRenderizar: () => undefined,
      aoTick: () => relogio1x.avancarTick(),
    })
    const loop2x = new GameLoop({
      aoRenderizar: () => undefined,
      aoTick: () => relogio2x.avancarTick(),
      velocidadeInicial: 2,
    })

    for (let i = 0; i < TICKS_POR_SEGUNDO; i++) {
      loop1x.processarFrame(DT_TICK)
      loop2x.processarFrame(DT_TICK)
    }

    expect(relogio1x.obterData().hour).toBe(1)
    expect(relogio2x.obterData().hour).toBe(2)
  })

  it('4× em 1s real avança 4 horas', () => {
    const relogio = new GameClock()
    const loop = new GameLoop({
      aoRenderizar: () => undefined,
      aoTick: () => relogio.avancarTick(),
      velocidadeInicial: 4,
    })

    for (let i = 0; i < TICKS_POR_SEGUNDO; i++) {
      loop.processarFrame(DT_TICK)
    }

    expect(relogio.obterData().hour).toBe(4)
  })
})
