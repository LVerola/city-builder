# City Builder

Jogo de construção de cidade no navegador. A etapa 0 sobe o anfitrião web e o contrato da engine: menu, canvas, timestep fixo, relógio e seed determinística. Não há conta, API nem persistência.

## Requisitos

- Node.js **22** ou superior
- [pnpm](https://pnpm.io) (o repositório declara `pnpm@11.13.1`)

## Como arrancar

Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

O comando abre o **menu** em `http://localhost:3000/` (`/`).

- A ação **Jogar** navega para `/jogo`.
- Em `/jogo` aparece um canvas 2D com um placeholder (a cor pulsa com os ticks). O canvas só é montado nessa rota — a página inicial não carrega o bundle do jogo.
- Clique no mapa para focar o canvas. **Espaço** pausa ou retoma; **1**, **2** e **4** escolhem a velocidade. Sem foco no mapa, as teclas não mudam o relógio.
- O indicador mostra data/hora em PT-BR (`Ano 1 · 1 jan · 00h`) e a velocidade (`Pausado`, `1×`, `2×`, `4×`).

## Stack

- **Next.js 16.4.4** (App Router, React 19, TypeScript strict, Turbopack) em `apps/web`
- Tailwind CSS 4.3.3
- `packages/game-core` — loop a 20 ticks/s, relógio e gerador com seed `123456` (Vitest)

A linha **16.4.4** é a estável atual e inclui o patch de segurança posterior à **16.3.8**. Não use 16.3.8: essa versão tem CVEs conhecidas.

## Scripts (raiz)

- `pnpm dev` — desenvolvimento da app `web`
- `pnpm build` — build das apps do workspace
- `pnpm test` — testes das apps e do `game-core`
- `pnpm lint` — lint das apps do workspace
