# US-103: Selecionar um tile com o mouse

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** clicar em um tile para selecioná-lo,
**para que** saiba exatamente o lugar do mapa onde as ferramentas vão atuar.

## 2. Contexto e justificativa

Pan e terreno ainda não dão um alvo. Construir estrada, zonar e inspecionar dependem de traduzir o clique no canvas para uma coordenada de tile.

A ferramenta **Select** é a primeira do conjunto da arquitetura (seção 31). O destaque visual fica no Canvas; o React pode saber *qual* tile está selecionado (estado de UI), mas não desenha o mundo.

Métrica de sucesso: cliques repetidos em tiles adjacentes, incluindo bordas e cantos do mapa, selecionam sempre a tile correta e mostram um destaque único.

## 3. Regras de negócio

- RN1: Clique com o **botão esquerdo** sobre o mapa, com a ferramenta Select ativa (padrão ao abrir `/jogo`), seleciona a tile sob o cursor.
- RN2: Existe no máximo **uma** tile selecionada de cada vez.
- RN3: A tile selecionada recebe um destaque visual no Canvas (contorno ou overlay), distinto do terreno — o destaque **não** depende só da cor.
- RN4: Clique noutra tile transfere a seleção; a anterior perde o destaque.
- RN5: Clique fora do mapa (na UI, ou coordenadas de mundo fora de 0..63) **limpa** a seleção. Não cria seleção inválida.
- RN6: Clique exatamente sobre a fronteira entre duas tiles pertence a **uma** tile, de forma determinística (`floor` da coordenada de mundo).
- RN7: A seleção é estado de UI + referência na engine; não muta terreno, zona nem edifícios.
- RN8: Com o canvas focado e uma tile selecionada, as **setas** movem a seleção de uma tile (não saem do mapa 0..63). Sem seleção, as setas fazem pan (US-101). **WASD nunca move a seleção.**

## 4. Critérios de aceitação (Gherkin)

### CA1: Clique seleciona a tile correta
```gherkin
Dado que a ferramenta Select está ativa
E o mapa 64×64 está visível
Quando clico com o botão esquerdo no centro da tile (10, 15)
Então a tile selecionada é (10, 15)
E essa tile apresenta destaque visual no canvas
```

### CA2: Trocar de seleção
```gherkin
Dado que a tile (10, 15) está selecionada
Quando clico na tile (11, 15)
Então a tile selecionada passa a ser (11, 15)
E a tile (10, 15) deixa de ter destaque
E apenas uma tile permanece destacada
```

### CA3: Clique fora do mapa limpa a seleção
```gherkin
Dado que existe uma tile selecionada
Quando clico numa zona da tela que não corresponde a nenhuma tile do mundo
Então nenhuma tile com coordenada fora de 0..63 fica selecionada
E a seleção anterior é limpa
```

### CA4: Fronteira entre tiles é determinística
```gherkin
Dado que estou na ferramenta Select
Quando clico exatamente na borda compartilhada pelas tiles (4, 4) e (5, 4)
Então exatamente uma das duas tiles fica selecionada
E cliques repetidos no mesmo pixel selecionam sempre a mesma tile
```

### CA5: Seleção sobrevive a pan/zoom
```gherkin
Dado que a tile (20, 20) está selecionada
Quando faço pan e zoom
Então a tile (20, 20) continua selecionada
E o destaque acompanha a posição dessa tile no canvas
```

### CA6: Setas movem a seleção
```gherkin
Dado que o canvas tem foco
E a tile (10, 10) está selecionada
Quando pressiono Seta direita
Então a tile selecionada passa a ser (11, 10)
Quando a tile selecionada é (63, 10)
E pressiono Seta direita
Então a tile selecionada permanece (63, 10)
Quando pressiono W
Então a seleção não muda
E a câmera pode fazer pan (US-101)
```

## 5. Fora do escopo

- Painel de inspeção com atributos (US-206).
- Seleção em área (retângulo) — só tile única.
- Seleção de edifício como entidade distinta (o clique no edifício seleciona a tile de origem nesta US).
- Touch / long-press.

## 6. Dependências

- **Bloqueia:** US-201, US-206
- **Bloqueada por:** US-101 (transformação tela → mundo), US-102 (tiles existem)
- **Relacionada:** US-104 (grid e coordenada selecionada no overlay)

## 7. Requisitos não-funcionais

- **Performance:** picking em O(1) via coordenadas (não varrer 4096 tiles).
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** destaque com contorno visível (não só cor). Movimento da seleção por setas com o canvas focado.
- **Observabilidade:** coordenada da tile selecionada visível no debug (US-104).
- **Internacionalização:** sem copy obrigatória nesta US.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Clique fora **limpa** a seleção
- [x] Select é a ferramenta predefinida ao entrar em `/jogo`
- [x] Setas movem a seleção (WASD não)
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes da conversão cursor → tile (centro, borda, fora do mapa, setas, limites) a passar sem browser
- [ ] Critérios de aceitação validados no canvas
- [ ] Destaque desenhado no Canvas, não como componente React por tile
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Clique fora **limpa** a seleção: proposta **aceito**.
- Ferramenta Select predefinida ao entrar no jogo: **aceito**.
- Setas para mover a seleção: **sim**, neste lote. WASD continua a ser pan (US-101).
