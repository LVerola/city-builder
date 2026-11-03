export const TICKS_POR_HORA = 20
export const HORAS_POR_DIA = 24
export const DIAS_POR_MES = 30
export const MESES_POR_ANO = 12

const MESES_ABREVIADOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const

export type GameDate = {
  year: number
  month: number
  day: number
  hour: number
}

const DATA_INICIAL: GameDate = { year: 1, month: 1, day: 1, hour: 0 }

export class GameClock {
  private year: number
  private month: number
  private day: number
  private hour: number
  private ticksNaHoraAtual = 0

  constructor(dataInicial: Partial<GameDate> = {}) {
    this.year = dataInicial.year ?? DATA_INICIAL.year
    this.month = dataInicial.month ?? DATA_INICIAL.month
    this.day = dataInicial.day ?? DATA_INICIAL.day
    this.hour = dataInicial.hour ?? DATA_INICIAL.hour
  }

  avancarTick(): void {
    this.ticksNaHoraAtual += 1
    if (this.ticksNaHoraAtual < TICKS_POR_HORA) {
      return
    }
    this.ticksNaHoraAtual = 0
    this.avancarHora()
  }

  obterData(): GameDate {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
    }
  }

  private avancarHora(): void {
    this.hour += 1
    if (this.hour < HORAS_POR_DIA) {
      return
    }
    this.hour = 0
    this.day += 1
    if (this.day <= DIAS_POR_MES) {
      return
    }
    this.day = 1
    this.month += 1
    if (this.month <= MESES_POR_ANO) {
      return
    }
    this.month = 1
    this.year += 1
  }
}

export function formatarDataDoJogo(data: GameDate): string {
  const mes = MESES_ABREVIADOS[data.month - 1] ?? String(data.month)
  const hora = String(data.hour).padStart(2, '0')
  return `Ano ${data.year} · ${data.day} ${mes} · ${hora}h`
}
