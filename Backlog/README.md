# Backlog — Escopo inicial (E0, E1 e E2)

> **Origem:** recorte do escopo inicial a partir de `docs/architecture/city-builder-arquitetura-tecnica.md` (seções 54, 57 e 58) e da divisão em entregas E0–E3.
> **Status:** Em refinamento
> **Data:** 2026-10-01
>
> **Acompanhamento:** marca Planejado / Refinado / Desenvolvido em [etapas.md](./etapas.md).

Este lote cobre **E0 — Fundações**, **E1 — Mundo navegável** e **E2 — Sandbox de construção**. Não implementa simulação econômica, save, backend nem polish.

A Fase 0 da arquitetura lista também câmera e input; neste backlog isso ficou em **E1** (US-101, US-103), para E0 fechar só o contrato da engine + anfitrião web.

## Ordem sugerida de desenvolvimento

```text
US-001 → US-002 → US-003
              └→ US-004
                    │
                    ▼
              US-101 → US-102 → US-103 → US-104
                                            │
                                            ▼
                                       US-201  (primeira ferramenta + comando)
                                            │
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                         US-202          US-203          US-206
                            │               │               ▲
                            └──────► US-204 ┘               │
                                       │                    │
                                       ▼                    │
                                    US-205 ─────────────────┘
```

`US-003` e `US-004` podem avançar em paralelo depois de `US-002`.  
`US-206` pode avançar em paralelo a partir de `US-103`, mas só fica completa quando houver estrada/zona/edifício para inspecionar.

## Inventário

| ID | Entrega | Título | SP | Dependência principal |
|---|---|---|---|---|
| [US-001](./US-001-abrir-jogo-canvas.md) | E0 | Abrir o jogo no browser com canvas | 5 | — |
| [US-002](./US-002-timestep-fixo.md) | E0 | Avançar a simulação em timestep fixo | 5 | US-001 |
| [US-003](./US-003-relogio-do-jogo.md) | E0 | Controlar o relógio do jogo | 3 | US-002 |
| [US-004](./US-004-seed-deterministica.md) | E0 | Reproduzir a simulação com seed | 3 | US-002 |
| [US-101](./US-101-navegar-mapa-camera.md) | E1 | Navegar o mapa com a câmera | 5 | US-001, US-002 |
| [US-102](./US-102-visualizar-terreno-chunks.md) | E1 | Visualizar terreno em tiles e chunks | 5 | US-101 |
| [US-103](./US-103-selecionar-tile.md) | E1 | Selecionar um tile com o mouse | 5 | US-102 |
| [US-104](./US-104-modo-debug-mapa.md) | E1 | Diagnosticar o mapa no modo debug | 3 | US-102 |
| [US-201](./US-201-pintar-terreno.md) | E2 | Pintar o terreno com ferramenta | 5 | US-103 |
| [US-202](./US-202-construir-estradas.md) | E2 | Construir estradas | 5 | US-201 |
| [US-203](./US-203-zonar-area.md) | E2 | Zonar uma área (R/C/I) | 3 | US-201 |
| [US-204](./US-204-construir-edificio.md) | E2 | Construir edifício a partir de definição | 5 | US-202, US-203 |
| [US-205](./US-205-demolir-construcao.md) | E2 | Demolir construção, estrada ou zona | 3 | US-202, US-204 |
| [US-206](./US-206-inspecionar-entidade.md) | E2 | Inspecionar tile ou edifício no HUD | 5 | US-103, US-003 |

**Total E0:** 16 SP (~83 h com buffer)  
**Total E1:** 18 SP (~94 h com buffer)  
**Total E2:** 26 SP (~136 h com buffer)  
**Lote E0–E2:** 60 SP (~312 h com buffer)

Estimativas são preliminares (Fibonacci × ~4 h/SP × 30 % de buffer). O refinement da equipe prevalece.

## Critério de saída das entregas

- **E0 pronta:** `pnpm` abre o menu em `/`; **Jogar** leva a `/jogo` com canvas placeholder; o loop avança 20 ticks/s independentes do FPS; o relógio pausa/1×/2×/4×; um teste Vitest reproduz a mesma seed. `game-core` (a partir da US-002) não depende de React, Canvas nem HTTP.
- **E1 pronta:** o jogador percorre um mapa 64×64 com cinco tipos de terreno, seleciona tiles, e consegue ligar o overlay de debug (grid, chunks, FPS/TPS).
- **E2 pronta:** o jogador pinta terreno, traça estradas, zona R/C/I, coloca 2–3 edifícios definidos por dados, demole e inspeciona no HUD — tudo sem React a montar um componente por entidade.

## Fora deste lote (E3+ / pós-MVP)

- população, emprego, impostos, dinheiro do jogador;
- eletricidade, água, serviços, tráfego, políticas;
- save (IndexedDB ou cloud), autenticação, API .NET;
- undo/redo visível, replay, heatmaps, áudio, tutorial;
- WebGL/WebGPU, ECS, modding.

## Suposições globais

- 🔶 Persona de jogo: **jogador**. Fundações e debug também servem o **desenvolvedor da engine**.
- Workspace **pnpm** + **Next.js 16.3.8** (App Router) + TypeScript strict + **Tailwind**; **sem** `apps/api` neste lote. Packages `game-*` só na US que os preencher (`game-core` na US-002).
- Rotas: `/` = menu; `/jogo` = canvas.
- Simulação a **20 ticks/s** a 1×; **20 ticks = 1 hora de jogo**; calendário MVP com meses de **30 dias**. O calendário **gregoriano** é visão futura (arquitetura, seção 7).
- Mapa inicial **64×64**, chunks **32×32**, cinco terrenos; mapa **gerado** com seed; sprites via Asset Manager na US-102.
- Câmera: pan com botão do meio (fallback direito) e **WASD**; zoom 0,5×–4× na roda e **pinch** de trackpad; setas pan só sem seleção.
- Estradas em E2: Manhattan em L, pressionar/soltar, coexistem com zona; permitidas em grass/sand/forest. Grafo de tráfego fica para depois.
- Custo de construção existe nos JSON, **não é debitado** neste lote (E3). Zona **não** é pré-requisito para colocar edifício.
- Zona de escritórios (`office`) não entra; só residencial, comercial e industrial.

## Próximo passo

1. Validar as US no refinement (números 🔶 e perguntas ❓).
2. Decompor **US-001** com `@tarefas-user-story` — é a primeira história do caminho crítico.
