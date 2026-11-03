import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function listarFontesDeProducao(diretorio: string): string[] {
  const encontrados: string[] = []
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = join(diretorio, entrada.name)
    if (entrada.isDirectory()) {
      encontrados.push(...listarFontesDeProducao(caminho))
      continue
    }
    if (entrada.name.endsWith('.ts') && !entrada.name.endsWith('.test.ts')) {
      encontrados.push(caminho)
    }
  }
  return encontrados
}

describe('proibição de acaso global', () => {
  it('CA3: packages/game-* não usam Math.random nem crypto.getRandomValues', () => {
    const diretorioPackages = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
    const pacotesDeJogo = readdirSync(diretorioPackages, { withFileTypes: true }).filter(
      (entrada) => entrada.isDirectory() && entrada.name.startsWith('game-'),
    )

    expect(pacotesDeJogo.length).toBeGreaterThan(0)

    const padroes = [/Math\.random/, /crypto\.getRandomValues/]
    for (const pacote of pacotesDeJogo) {
      const diretorioSrc = join(diretorioPackages, pacote.name, 'src')
      if (!existsSync(diretorioSrc)) {
        continue
      }
      const fontes = listarFontesDeProducao(diretorioSrc)
      for (const arquivo of fontes) {
        const fonte = readFileSync(arquivo, 'utf8')
        for (const padrao of padroes) {
          expect(fonte, `${arquivo} contém ${padrao}`).not.toMatch(padrao)
        }
      }
    }
  })
})
