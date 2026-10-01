# Acompanhamento das etapas

> **Como usar:** marca da esquerda para a direita. Não saltes um estado: *Desenvolvido* implica *Refinado*, que implica *Planejado*.
> **Última actualização:** 2026-10-01

**Próximo foco:** refinar a [US-001](./US-001-abrir-jogo-canvas.md) (primeira do caminho crítico).

Inventário das user stories: [README.md](./README.md).

## Legenda

| Estado | Quando marcar |
|---|---|
| **Planejado** | A etapa ou a US está recortada por escrito (ficheiro no backlog ou linha neste documento). |
| **Refinado** | 🔶 e ❓ fechados, DoR cumprido, a equipa estima e aceita desenvolver. |
| **Desenvolvido** | DoD cumprido: merged, testes a passar, critérios de aceitação validados. |

---

## Resumo

Marca só o estado da **etapa inteira** (todas as US dela no mesmo estado, ou a etapa ainda sem US).

### Etapa 0 — Fundações
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 1 — Mundo navegável
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 2 — Sandbox de construção
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 3 — Cidade viva + save local
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 4 — Tráfego
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 5 — Sociedade
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 6 — Políticas
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 7 — Cloud save
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### Etapa 8 — Polish
- [ ] Planejado
- [ ] Refinado
- [ ] Desenvolvido

---

## Etapa 0 — Fundações

Critério de saída: `pnpm` abre o jogo; canvas com placeholder; 20 ticks/s independentes do FPS; relógio pausa/1×/2×/4×; teste com a mesma seed; `game-core` sem React/Canvas/HTTP.

### US-001 — Abrir o jogo no browser com canvas
[ficheiro](./US-001-abrir-jogo-canvas.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-002 — Avançar a simulação em timestep fixo
[ficheiro](./US-002-timestep-fixo.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-003 — Controlar o relógio do jogo
[ficheiro](./US-003-relogio-do-jogo.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-004 — Reproduzir a simulação com seed
[ficheiro](./US-004-seed-deterministica.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

Quando as quatro US estiverem *Desenvolvido*, marca a Etapa 0 no resumo.

---

## Etapa 1 — Mundo navegável

Critério de saída: mapa 64×64 com cinco terrenos, selecção de tile, overlay de debug (grid, chunks, FPS/TPS).

### US-101 — Navegar o mapa com a câmara
[ficheiro](./US-101-navegar-mapa-camera.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-102 — Visualizar terreno em tiles e chunks
[ficheiro](./US-102-visualizar-terreno-chunks.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-103 — Selecionar um tile com o rato
[ficheiro](./US-103-selecionar-tile.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-104 — Diagnosticar o mapa no modo debug
[ficheiro](./US-104-modo-debug-mapa.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

Quando as quatro US estiverem *Desenvolvido*, marca a Etapa 1 no resumo.

---

## Etapa 2 — Sandbox de construção

Critério de saída: pintar terreno, estradas, zonas R/C/I, 2–3 edifícios por dados, demolir, inspecionar no HUD — sem React por entidade.

### US-201 — Pintar o terreno com ferramenta
[ficheiro](./US-201-pintar-terreno.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-202 — Construir estradas
[ficheiro](./US-202-construir-estradas.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-203 — Zonar uma área (R/C/I)
[ficheiro](./US-203-zonar-area.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-204 — Construir edifício a partir de definição
[ficheiro](./US-204-construir-edificio.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-205 — Demolir construção, estrada ou zona
[ficheiro](./US-205-demolir-construcao.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

### US-206 — Inspecionar tile ou edifício no HUD
[ficheiro](./US-206-inspecionar-entidade.md)
- [x] Planejado
- [ ] Refinado
- [ ] Desenvolvido

Quando as seis US estiverem *Desenvolvido*, marca a Etapa 2 no resumo.

---

## Etapa 3 — Cidade viva + save local

Ainda **sem user stories**. Marca *Planejado* quando o lote de US existir no backlog.

Escopo previsto: população e emprego agregados; dinheiro + imposto simples; procura R/C/I no HUD; electricidade/água globais; save versionado em IndexedDB.

- [ ] Recortar US (3.1 simulação mínima)
- [ ] Recortar US (3.2 persistência local)

---

## Etapas seguintes (pós-MVP)

Ainda sem US. Marca *Planejado* no resumo quando cada uma for quebrada em histórias.

### Etapa 4 — Tráfego
Rede viária, pathfinding, procura agregada, congestionamento.

### Etapa 5 — Sociedade
Renda, educação, saúde, crime, poluição, felicidade, migração.

### Etapa 6 — Políticas
Políticas, modificadores, explainability.

### Etapa 7 — Cloud save
API .NET, autenticação, PostgreSQL, o mesmo `SaveGame` do IndexedDB.

### Etapa 8 — Polish
Heatmaps, partículas, áudio, tutorial, gráficos.
