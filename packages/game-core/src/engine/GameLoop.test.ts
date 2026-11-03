import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  DT_TICK,
  GameLoop,
  TETO_TICKS_POR_FRAME,
  TICKS_POR_SEGUNDO,
  type VelocidadeDoJogo,
} from './GameLoop'

function criarLoop(aoRenderizar: () => void = () => undefined, aoTick?: (ticks: number) => void) {
  return new GameLoop({ aoRenderizar, aoTick })
}

function listarArquivosFonte(diretorio: string): string[] {
  const encontrados: string[] = []
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = join(diretorio, entrada.name)
    if (entrada.isDirectory()) {
      encontrados.push(...listarArquivosFonte(caminho))
      continue
    }
    if (entrada.name.endsWith('.ts') && !entrada.name.endsWith('.test.ts')) {
      encontrados.push(caminho)
    }
  }
  return encontrados
}

describe('GameLoop', () => {
  it('CA1: 1,00s de tempo de jogo a 1× executa exatamente 20 ticks', () => {
    const loop = criarLoop()

    for (let i = 0; i < TICKS_POR_SEGUNDO; i++) {
      loop.processarFrame(DT_TICK)
    }

    expect(loop.obterContagemDeTicks()).toBe(20)
  })

  it('CA1: sessenta frames de 1/60 somam 1s e produzem 20 ticks', () => {
    const loop = criarLoop()

    for (let i = 0; i < 60; i++) {
      loop.processarFrame(1 / 60)
    }

    expect(loop.obterContagemDeTicks()).toBe(20)
  })

  it('CA2: o código-fonte do core não importa react/next nem usa canvas/DOM', () => {
    const diretorioSrc = join(dirname(fileURLToPath(import.meta.url)), '..')
    const padroesProibidos = [
      /from ['"]react['"]/,
      /from ['"]react\//,
      /from ['"]next/,
      /getContext/,
      /document\./,
      /window\./,
    ]

    for (const arquivo of listarArquivosFonte(diretorioSrc)) {
      const fonte = readFileSync(arquivo, 'utf8')
      for (const padrao of padroesProibidos) {
        expect(fonte, `${arquivo} contém ${padrao}`).not.toMatch(padrao)
      }
    }
  })

  it('CA3: frames com dt irregular que somam 1,00s produzem 20 ticks e renders ≠ 20', () => {
    let chamadasDeRender = 0
    const loop = criarLoop(() => {
      chamadasDeRender += 1
    })
    const intervalosEmTicks = [1, 2, 3, 1, 4, 2, 1, 3, 2, 1]
    expect(intervalosEmTicks.reduce((soma, ticks) => soma + ticks, 0)).toBe(TICKS_POR_SEGUNDO)

    for (const ticksDoFrame of intervalosEmTicks) {
      loop.processarFrame(ticksDoFrame * DT_TICK)
    }

    expect(loop.obterContagemDeTicks()).toBe(20)
    expect(chamadasDeRender).toBe(intervalosEmTicks.length)
    expect(chamadasDeRender).not.toBe(20)
  })

  it('CA4: um frame de 1,0s aplica no máximo 5 ticks e descarta o excesso', () => {
    const loop = criarLoop()

    loop.processarFrame(1)

    expect(loop.obterContagemDeTicks()).toBe(TETO_TICKS_POR_FRAME)

    loop.processarFrame(1e-6)

    expect(loop.obterContagemDeTicks()).toBe(TETO_TICKS_POR_FRAME)
  })

  it('CA6: aoRenderizar corre depois dos ticks e vê a contagem já atualizada', () => {
    const ordem: string[] = []
    let ticksVistosNoRender = 0
    const loop = new GameLoop({
      aoTick: () => {
        ordem.push('tick')
      },
      aoRenderizar: () => {
        ordem.push('render')
        ticksVistosNoRender = loop.obterContagemDeTicks()
      },
    })

    loop.processarFrame(DT_TICK)

    expect(ordem).toEqual(['tick', 'render'])
    expect(ticksVistosNoRender).toBe(1)
  })

  it('pausa: velocidade 0 não avança ticks e ainda chama aoRenderizar', () => {
    let chamadasDeRender = 0
    const loop = criarLoop(() => {
      chamadasDeRender += 1
    })

    loop.definirVelocidade(0)
    loop.processarFrame(1)

    expect(loop.estaPausado()).toBe(true)
    expect(loop.obterContagemDeTicks()).toBe(0)
    expect(chamadasDeRender).toBe(1)
  })

  it('pausar guarda a última velocidade não-zero e retomar restaura', () => {
    const loop = criarLoop()
    loop.definirVelocidade(2)
    loop.pausar()

    expect(loop.estaPausado()).toBe(true)
    expect(loop.obterVelocidade()).toBe(0)

    loop.processarFrame(DT_TICK)
    expect(loop.obterContagemDeTicks()).toBe(0)

    loop.retomar()

    expect(loop.estaPausado()).toBe(false)
    expect(loop.obterVelocidade()).toBe(2)

    loop.processarFrame(DT_TICK)
    expect(loop.obterContagemDeTicks()).toBe(2)
  })

  it('definirVelocidade ignora valor inválido sem lançar', () => {
    const loop = criarLoop()

    expect(() => loop.definirVelocidade(3 as VelocidadeDoJogo)).not.toThrow()
    expect(loop.obterVelocidade()).toBe(1)
  })
})
