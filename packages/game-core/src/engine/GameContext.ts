import { RandomGenerator, SEMENTE_PADRAO } from './RandomGenerator'

export class GeradorAusenteError extends Error {
  constructor() {
    super('Gerador aleatório não configurado no contexto da engine')
    this.name = 'GeradorAusenteError'
  }
}

export type OpcoesDoGameContext = {
  semente?: number
  gerador?: RandomGenerator
  semGerador?: boolean
}

export class GameContext {
  private readonly semente: number
  private readonly gerador: RandomGenerator | null

  constructor(opcoes: OpcoesDoGameContext = {}) {
    if (opcoes.semGerador) {
      this.semente = opcoes.semente ?? SEMENTE_PADRAO
      this.gerador = null
      return
    }
    if (opcoes.gerador) {
      this.gerador = opcoes.gerador
      this.semente = opcoes.gerador.obterSemente()
      return
    }
    this.semente = opcoes.semente ?? SEMENTE_PADRAO
    this.gerador = new RandomGenerator(this.semente)
  }

  obterSemente(): number {
    return this.semente
  }

  obterGerador(): RandomGenerator {
    if (this.gerador === null) {
      throw new GeradorAusenteError()
    }
    return this.gerador
  }
}

export function usarAcaso(contexto: GameContext): number {
  return contexto.obterGerador().proximo()
}
