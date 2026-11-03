export const TICKS_POR_SEGUNDO = 20
export const DT_TICK = 1 / TICKS_POR_SEGUNDO
export const TETO_TICKS_POR_FRAME = 5

export type VelocidadeDoJogo = 0 | 1 | 2 | 4

export type OpcoesDoGameLoop = {
  aoRenderizar: () => void
  aoTick?: (contagemDeTicks: number) => void
  velocidadeInicial?: VelocidadeDoJogo
}

const VELOCIDADES_PERMITIDAS: readonly VelocidadeDoJogo[] = [0, 1, 2, 4]

// ponytail: folga IEEE-754 para 1/60×60; se o erro crescer, trocar acumulador por µs inteiros
const FOLGA_DE_TICK = 1e-10

function éVelocidadeValida(valor: number): valor is VelocidadeDoJogo {
  return (VELOCIDADES_PERMITIDAS as readonly number[]).includes(valor)
}

export class GameLoop {
  private readonly aoRenderizar: () => void
  private readonly aoTick?: (contagemDeTicks: number) => void
  private velocidade: VelocidadeDoJogo
  private velocidadeAntesDePausar: VelocidadeDoJogo = 1
  private acumuladorDeTicks = 0
  private contagemDeTicks = 0
  private ticksNaJanela = 0
  private segundosNaJanela = 0
  private tpsObservado = 0

  constructor(opcoes: OpcoesDoGameLoop) {
    this.aoRenderizar = opcoes.aoRenderizar
    this.aoTick = opcoes.aoTick
    const velocidadeInicial = opcoes.velocidadeInicial
    this.velocidade =
      velocidadeInicial !== undefined && éVelocidadeValida(velocidadeInicial)
        ? velocidadeInicial
        : 1
    if (this.velocidade !== 0) {
      this.velocidadeAntesDePausar = this.velocidade
    }
  }

  processarFrame(dtSegundosReais: number): void {
    const dtValido =
      Number.isFinite(dtSegundosReais) && dtSegundosReais > 0 ? dtSegundosReais : 0

    if (this.velocidade > 0 && dtValido > 0) {
      this.acumuladorDeTicks += dtValido * this.velocidade * TICKS_POR_SEGUNDO
    }

    let ticksNesteFrame = 0
    while (
      this.acumuladorDeTicks + FOLGA_DE_TICK >= 1 &&
      ticksNesteFrame < TETO_TICKS_POR_FRAME
    ) {
      this.executarTick()
      this.acumuladorDeTicks -= 1
      ticksNesteFrame += 1
    }

    if (this.acumuladorDeTicks < 0) {
      this.acumuladorDeTicks = 0
    }

    if (ticksNesteFrame >= TETO_TICKS_POR_FRAME && this.acumuladorDeTicks + FOLGA_DE_TICK >= 1) {
      this.acumuladorDeTicks %= 1
    }

    this.atualizarTps(dtValido, ticksNesteFrame)
    this.aoRenderizar()
  }

  obterContagemDeTicks(): number {
    return this.contagemDeTicks
  }

  obterTps(): number {
    if (this.segundosNaJanela > 0) {
      return this.ticksNaJanela / this.segundosNaJanela
    }
    return this.tpsObservado
  }

  definirVelocidade(velocidade: VelocidadeDoJogo): void {
    if (!éVelocidadeValida(velocidade)) {
      return
    }
    this.velocidade = velocidade
    if (velocidade !== 0) {
      this.velocidadeAntesDePausar = velocidade
    }
  }

  obterVelocidade(): VelocidadeDoJogo {
    return this.velocidade
  }

  pausar(): void {
    if (this.velocidade === 0) {
      return
    }
    this.velocidadeAntesDePausar = this.velocidade
    this.velocidade = 0
  }

  retomar(): void {
    this.velocidade = this.velocidadeAntesDePausar
  }

  estaPausado(): boolean {
    return this.velocidade === 0
  }

  private executarTick(): void {
    this.contagemDeTicks += 1
    this.aoTick?.(this.contagemDeTicks)
  }

  private atualizarTps(dtValido: number, ticksNesteFrame: number): void {
    this.segundosNaJanela += dtValido
    this.ticksNaJanela += ticksNesteFrame
    if (this.segundosNaJanela < 1) {
      return
    }
    this.tpsObservado = this.ticksNaJanela / this.segundosNaJanela
    this.ticksNaJanela = 0
    this.segundosNaJanela = 0
  }
}
