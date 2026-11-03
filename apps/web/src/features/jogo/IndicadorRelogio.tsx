import {
  formatarDataDoJogo,
  type GameDate,
  type VelocidadeDoJogo,
} from "@city-builder/game-core";

function rotuloVelocidade(velocidade: VelocidadeDoJogo): string {
  if (velocidade === 0) {
    return "Pausado";
  }
  return `${velocidade}×`;
}

type PropriedadesIndicadorRelogio = {
  data: GameDate;
  velocidade: VelocidadeDoJogo;
};

export function IndicadorRelogio({ data, velocidade }: PropriedadesIndicadorRelogio) {
  return (
    <p className="mt-4 text-sm text-slate-200">
      <span>{formatarDataDoJogo(data)}</span>
      <span className="mx-2 text-slate-500" aria-hidden="true">
        ·
      </span>
      <span>{rotuloVelocidade(velocidade)}</span>
      <span className="mt-1 block text-slate-400">
        Espaço pausa ou retoma · 1, 2 e 4 mudam a velocidade (com o mapa focado)
      </span>
    </p>
  );
}
