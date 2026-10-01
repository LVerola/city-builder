# US-202: Construir estradas

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** traçar estradas entre dois pontos do mapa,
**para que** ligue áreas da cidade e prepare o chão para zonas e edifícios.

## 2. Contexto e justificativa

O milestone técnico da arquitectura (secção 57) é um mapa navegável **com uma estrada construída**. Sem isto, E2 não é um city builder — é um editor de terreno.

O comando `BUILD_ROAD` (origem e destino) é o contrato. O grafo de tráfego, pathfinding e congestionamento **não** entram: a estrada ocupa tiles e é visível. Isso já desbloqueia zonar ao longo da via e demolir depois.

Métrica de sucesso: o jogador activa a ferramenta Estrada, clica origem e destino, e vê um segmento contínuo no canvas, recusado quando atravessa um edifício.

## 3. Regras de negócio

- RN1: A ferramenta **Estrada** cria um comando `BUILD_ROAD` com `start` e `end` em coordenadas de tile.
- RN2: 🔶 O segmento é **ortogonal** (Manhattan): primeiro no eixo maior do delta, depois o outro (caminho em L, sem diagonal).
- RN3: Todas as tiles do caminho passam a ter estrada (`roadId` não nulo).
- RN4: Não se constrói estrada em tile que já tem **edifício**.
- RN5: Tile que já tem estrada no caminho é aceite (no-op nessa tile; o resto do segmento continua).
- RN6: 🔶 Não se constrói estrada em `water` nem `mountain`.
- RN7: Origem igual ao destino constrói **uma** tile de estrada (se a tile for válida).
- RN8: 🔶 Pré-visualização: enquanto o botão está premido (ou entre primeiro e segundo clique), o caminho previsto é mostrado no overlay, sem mutar o mundo até confirmar.

## 4. Critérios de aceitação (Gherkin)

### CA1: Construir um segmento horizontal
```gherkin
Dado que a ferramenta Estrada está activa
E as tiles de (5, 10) a (9, 10) são grass vazias
Quando confirmo uma estrada de (5, 10) até (9, 10)
Então as tiles (5, 10), (6, 10), (7, 10), (8, 10) e (9, 10) têm estrada
E o canvas desenha a estrada nessas tiles
E as restantes tiles do mapa não ganham estrada
```

### CA2: Recusar caminho que atravessa edifício
```gherkin
Dado que a ferramenta Estrada está activa
E existe um edifício que ocupa a tile (6, 10)
Quando tento construir estrada de (5, 10) até (9, 10)
Então nenhuma tile nova recebe estrada
E o edifício permanece
E o jogador recebe feedback de recusa
```

### CA3: Origem e destino na mesma tile
```gherkin
Dado que a ferramenta Estrada está activa
E a tile (3, 3) é grass vazia
Quando confirmo uma estrada de (3, 3) até (3, 3)
Então apenas a tile (3, 3) passa a ter estrada
```

### CA4: Recusar água e montanha
```gherkin
Dado que a ferramenta Estrada está activa
E a tile (0, 1) é water
Quando tento construir uma estrada que inclui (0, 1)
Então o comando é recusado
E nenhuma tile do segmento é alterada
```

### CA5: Comando headless
```gherkin
Dado um mundo sem UI com tiles (0, 0) a (3, 0) grass vazias
Quando a engine executa BUILD_ROAD de (0, 0) para (3, 0)
Então as quatro tiles têm estrada
E um evento de estrada construída é emitido
```

## 5. Fora do escopo

- Grafo de nós/arestas para tráfego, capacidade, speed limit (modelo de dados pode nascer simples; simulação não).
- Veículos visuais, semáforos, faixas múltiplas.
- Estradas diagonais, curvas suaves, pontes, túneis.
- Custo de construção debitado do tesouro (E3).
- Desfazer.

## 6. Dependências

- **Bloqueia:** US-204 (edifício não deve sobrepor estrada), US-205
- **Bloqueada por:** US-201 (paleta + comandos)
- **Relacionada:** US-203 (zonas ao lado da estrada), US-206 (inspecionar tile com estrada)

## 7. Requisitos não-funcionais

- **Performance:** segmento até 64 tiles num único comando, sem React por tile de estrada.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** ferramenta identificada em texto (`Estrada`); recusa compreensível em PT-BR.
- **Observabilidade:** motivo de recusa do comando testável (`TERRENO_INVALIDO`, `OCUPADO_POR_EDIFICIO`).
- **Internacionalização:** UI em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN2 (Manhattan vs só eixo único por gesto) confirmado
- [ ] RN8: gesto de dois cliques vs drag confirmado
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless (horizontal, L, mesma tile, recusas) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] Estradas desenhadas no Canvas (camada de estradas), não em React
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Gesto: **pressionar na origem, soltar no destino** (igual ao `onMouseDown`/`onMouseUp` da ferramenta). Alternativa de dois cliques se o refinement preferir.
- 🔶 Caminho em L (Manhattan) em vez de só linhas rectas de um eixo — cobre o exemplo da arquitectura com menos gestos.
- ❓ Estrada sobre `sand` e `forest` é permitida (sim nesta US)?
- ❓ Estrada substitui zona na tile ou coexiste (`tile.zone` + `tile.roadId`)? Arquitectura permite ambos os campos; 🔶 coexistir.
