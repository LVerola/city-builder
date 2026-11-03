# US-202: Construir estradas

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** traçar estradas entre dois pontos do mapa,
**para que** ligue áreas da cidade e prepare o chão para zonas e edifícios.

## 2. Contexto e justificativa

O milestone técnico da arquitetura (seção 57) é um mapa navegável **com uma estrada construída**. Sem isto, E2 não é um city builder — é um editor de terreno.

O comando `BUILD_ROAD` (origem e destino) é o contrato. O grafo de tráfego, pathfinding e congestionamento **não** entram: a estrada ocupa tiles e é visível.

Métrica de sucesso: o jogador ativa a ferramenta Estrada, pressiona na origem, solta no destino, e vê um segmento contínuo no canvas, recusado quando atravessa um edifício, água ou montanha.

## 3. Regras de negócio

- RN1: A ferramenta **Estrada** cria um comando `BUILD_ROAD` com `start` e `end` em coordenadas de tile.
- RN2: O segmento é **ortogonal** (Manhattan): primeiro no eixo maior do delta, depois o outro (caminho em L, sem diagonal).
- RN3: Todas as tiles do caminho passam a ter estrada (`roadId` não nulo).
- RN4: Não se constrói estrada em tile que já tem **edifício**.
- RN5: Tile que já tem estrada no caminho é aceita (no-op nessa tile; o resto do segmento continua).
- RN6: Não se constrói estrada em `water` nem `mountain`. **É permitida** em `grass`, `sand` e `forest`.
- RN7: Origem igual ao destino constrói **uma** tile de estrada (se a tile for válida).
- RN8: Gesto: **pressionar na origem, soltar no destino**. Enquanto o botão está premido, o caminho previsto é mostrado no overlay, sem mutar o mundo até soltar.
- RN9: Estrada **coexiste** com zona (`tile.zone` + `tile.roadId`). Não apaga a zona.
- RN10: Se qualquer tile do caminho for inválida (água, montanha, edifício), o comando é recusado por inteiro.

## 4. Critérios de aceitação (Gherkin)

### CA1: Construir um segmento horizontal
```gherkin
Dado que a ferramenta Estrada está ativa
E as tiles de (5, 10) a (9, 10) são grass vazias
Quando pressiono em (5, 10) e solto em (9, 10)
Então as tiles (5, 10), (6, 10), (7, 10), (8, 10) e (9, 10) têm estrada
E o canvas desenha a estrada nessas tiles
```

### CA2: Recusar caminho que atravessa edifício
```gherkin
Dado que a ferramenta Estrada está ativa
E existe um edifício que ocupa a tile (6, 10)
Quando tento construir estrada de (5, 10) até (9, 10)
Então nenhuma tile nova recebe estrada
E o edifício permanece
E o jogador recebe feedback de recusa
```

### CA3: Origem e destino na mesma tile
```gherkin
Dado que a ferramenta Estrada está ativa
E a tile (3, 3) é grass vazia
Quando pressiono e solto em (3, 3)
Então apenas a tile (3, 3) passa a ter estrada
```

### CA4: Recusar água e montanha; aceitar areia e floresta
```gherkin
Dado que a ferramenta Estrada está ativa
E a tile (0, 1) é water
Quando tento um segmento que inclui (0, 1)
Então o comando é recusado
E nenhuma tile do segmento é alterada
Dado um segmento só sobre sand e forest vazias
Quando confirmo
Então essas tiles passam a ter estrada
```

### CA5: Comando headless e coexistência com zona
```gherkin
Dado um mundo sem UI com tiles (0, 0) a (3, 0) grass
E (1, 0) tem zona residencial
Quando a engine executa BUILD_ROAD de (0, 0) para (3, 0)
Então as quatro tiles têm estrada
E (1, 0) mantém a zona residencial
E um evento de estrada construída é emitido
```

### CA6: Pré-visualização em L
```gherkin
Dado que a ferramenta Estrada está ativa
Quando pressiono em (0, 0) e movo até (2, 1) sem soltar
Então o overlay mostra o caminho Manhattan (em L) sem mutar o mundo
Quando solto
Então o mundo passa a ter estrada nesse caminho
```

## 5. Fora do escopo

- Grafo de nós/arestas para tráfego, capacidade, speed limit.
- Veículos visuais, semáforos, faixas múltiplas.
- Estradas diagonais, curvas suaves, pontes, túneis.
- Custo de construção debitado do tesouro (E3).
- Desfazer.
- Gesto de dois cliques.

## 6. Dependências

- **Bloqueia:** US-204, US-205
- **Bloqueada por:** US-201 (paleta + comandos)
- **Relacionada:** US-203 (zona coexiste), US-206 (inspecionar tile com estrada)

## 7. Requisitos não-funcionais

- **Performance:** segmento até 64 tiles num único comando, sem React por tile de estrada.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** ferramenta identificada em texto (`Estrada`); recusa compreensível em PT-BR.
- **Observabilidade:** motivo de recusa testável (`TERRENO_INVALIDO`, `OCUPADO_POR_EDIFICIO`).
- **Internacionalização:** UI em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Manhattan em L; gesto pressionar/soltar; preview
- [x] Permitida em sand e forest; recusada em water e mountain
- [x] Coexiste com zona
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless (horizontal, L, mesma tile, recusas, zona intacta) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] Estradas desenhadas no Canvas, não em React
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Gesto pressionar/soltar: **aceito**.
- Caminho Manhattan em L: **aceito**.
- Estrada em `sand` e `forest`: **sim**.
- Estrada **coexiste** com zona: aceito.
