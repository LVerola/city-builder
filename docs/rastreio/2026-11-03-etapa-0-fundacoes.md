# Rastreio — Etapa 0: fundações (menu, canvas, loop, relógio, seed)

> **Data:** 2026-11-03
> **Branch:** `feat/etapa-0-fundacoes`
> **PR:**

## O que mudou

- Monorepo pnpm com `apps/web` (Next.js 16.4.4 + Tailwind 4.3.3) e `packages/game-core`.
- Menu em `/` e página `/jogo` com canvas placeholder (US-001).
- `GameLoop` em timestep fixo de 20 ticks/s, teto de 5 ticks/frame (US-002).
- Relógio do jogo com calendário MVP (30 dias/mês) e velocidades pausa/1×/2×/4× (US-003).
- Gerador determinístico com seed canónica 123456 (US-004).

## Por que

A etapa 0 fecha o contrato da engine e do anfitrião web sem mapa, sem backend e sem packages mortos. O Next 16.4.4 substitui o 16.3.8 da US-001 porque essa linha tem CVEs corrigidos em 16.4.1+.

## Arquivos

- `package.json`, `pnpm-workspace.yaml`, `.gitignore` — workspace pnpm
- `apps/web/` — anfitrião Next.js (menu, canvas, indicador do relógio, atalhos)
- `packages/game-core/` — GameLoop, GameClock, RandomGenerator, GameContext, testes Vitest
- `README.md` — como instalar, abrir o jogo e usar o relógio

## Como validar

1. `pnpm install` na raiz e `pnpm test` — Vitest do `game-core` verde.
2. `pnpm dev` → menu em `/` com **Jogar**; `/jogo` mostra canvas.
3. Em `/jogo`, com o canvas focado: Espaço pausa/retoma; 1/2/4 mudam a velocidade; indicador em PT-BR atualiza.
4. Sem foco no canvas, as teclas não mudam a velocidade.
