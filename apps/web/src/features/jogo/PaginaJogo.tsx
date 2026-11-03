"use client";

import {
  GameClock,
  GameContext,
  GameLoop,
  type GameDate,
  type VelocidadeDoJogo,
} from "@city-builder/game-core";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { IndicadorRelogio } from "./IndicadorRelogio";
import { interpretarAtalhoDoRelogio } from "./interpretarAtalhoDoRelogio";
import { obterContexto2d } from "./obterContexto2d";

const LARGURA_CANVAS = 960;
const ALTURA_CANVAS = 540;
const DATA_INICIAL: GameDate = { year: 1, month: 1, day: 1, hour: 0 };
const MENSAGEM_SEM_CONTEXTO =
  "Não foi possível iniciar o jogo: este navegador não disponibiliza o canvas 2D.";

function datasIguais(a: GameDate, b: GameDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour;
}

function desenharPlaceholder(
  contexto: CanvasRenderingContext2D,
  ticks: number,
): void {
  const pulso = 0.5 + 0.5 * Math.sin(ticks * 0.15);
  const verde = Math.round(58 + pulso * 40);
  contexto.fillStyle = `rgb(30, ${verde}, 95)`;
  contexto.fillRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);
  contexto.fillStyle = "#7dd3fc";
  contexto.fillRect(72, 72, 240, 120);
}

export default function PaginaJogo() {
  const referenciaCanvas = useRef<HTMLCanvasElement>(null);
  const referenciaLoop = useRef<GameLoop | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [data, setData] = useState<GameDate>(DATA_INICIAL);
  const [velocidade, setVelocidade] = useState<VelocidadeDoJogo>(1);

  useEffect(() => {
    const canvas = referenciaCanvas.current;
    const contexto2d = obterContexto2d(canvas);
    if (canvas === null || contexto2d === null) {
      setMensagemErro(MENSAGEM_SEM_CONTEXTO);
      return;
    }

    const relogio = new GameClock();
    const contexto = new GameContext();
    const loop = new GameLoop({
      aoTick: () => {
        relogio.avancarTick();
      },
      aoRenderizar: () => {
        desenharPlaceholder(contexto2d, loop.obterContagemDeTicks());
        const dataAtual = relogio.obterData();
        const velocidadeAtual = loop.obterVelocidade();
        setData((anterior) => (datasIguais(anterior, dataAtual) ? anterior : dataAtual));
        setVelocidade((anterior) =>
          anterior === velocidadeAtual ? anterior : velocidadeAtual,
        );
      },
    });
    referenciaLoop.current = loop;
    void contexto.obterSemente();

    let instanteAnterior: number | null = null;
    let idQuadro = 0;
    const quadro = (agora: number) => {
      if (instanteAnterior !== null) {
        loop.processarFrame((agora - instanteAnterior) / 1000);
      }
      instanteAnterior = agora;
      idQuadro = requestAnimationFrame(quadro);
    };
    idQuadro = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(idQuadro);
      referenciaLoop.current = null;
    };
  }, []);

  function aoTeclar(evento: KeyboardEvent<HTMLCanvasElement>) {
    const loop = referenciaLoop.current;
    if (loop === null) {
      return;
    }
    const atalho = interpretarAtalhoDoRelogio(evento.key);
    if (atalho === null) {
      return;
    }
    evento.preventDefault();
    if (atalho === "alternar-pausa") {
      if (loop.estaPausado()) {
        loop.retomar();
      } else {
        loop.pausar();
      }
      return;
    }
    loop.definirVelocidade(atalho);
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-slate-950 px-6 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold tracking-tight">Mapa do jogo</h1>
      <IndicadorRelogio data={data} velocidade={velocidade} />
      {mensagemErro !== null ? (
        <p className="mt-4 max-w-xl text-base text-amber-200" role="alert">
          {mensagemErro}
        </p>
      ) : null}
      <canvas
        ref={referenciaCanvas}
        width={LARGURA_CANVAS}
        height={ALTURA_CANVAS}
        tabIndex={0}
        aria-label="Mapa do jogo"
        onKeyDown={aoTeclar}
        className="mt-6 max-w-full border border-slate-700 bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      />
    </main>
  );
}
