# US-103: Selecionar um tile com o rato

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** clicar num tile para o selecionar,
**para que** saiba exactamente o sítio do mapa onde as ferramentas vão actuar.

## 2. Contexto e justificativa

Pan e terreno ainda não dão um alvo. Construir estrada, zonar e inspecionar dependem de traduzir o clique no canvas para uma coordenada de tile.

A ferramenta **Select** é a primeira do conjunto da arquitectura (secção 31). O destaque visual fica no Canvas; o React pode saber *qual* tile está selecionado (estado de UI), mas não desenha o mundo.

Métrica de sucesso: cliques repetidos em tiles adjacentes, incluindo bordos e cantos do mapa, selecionam sempre a tile correcta e mostram um destaque único.

## 3. Regras de negócio

- RN1: Clique com o **botão esquerdo** sobre o mapa, com a ferramenta Select activa (predefinição ao abrir o jogo), seleciona a tile sob o cursor.
- RN2: Existe no máximo **uma** tile selecionada de cada vez.
- RN3: A tile selecionada recebe um destaque visual no Canvas (contorno ou overlay), distinto do terreno.
- RN4: Clique noutra tile transfere a selecção; a anterior perde o destaque.
- RN5: Clique fora do mapa (na UI, ou coordenadas de mundo fora de 0..63) **não** cria uma selecção inválida.
- RN6: Clique exactamente sobre a fronteira entre duas tiles pertence a **uma** tile, de forma determinística (ex.: `floor` da coordenada de mundo).
- RN7: A selecção é estado de UI + referência na engine; não muta terreno, zona nem edifícios.

## 4. Critérios de aceitação (Gherkin)

### CA1: Clique seleciona a tile correcta
```gherkin
Dado que a ferramenta Select está activa
E o mapa 64×64 está visível
Quando clico com o botão esquerdo no centro da tile (10, 15)
Então a tile selecionada é (10, 15)
E essa tile apresenta destaque visual no canvas
```

### CA2: Trocar de selecção
```gherkin
Dado que a tile (10, 15) está selecionada
Quando clico na tile (11, 15)
Então a tile selecionada passa a ser (11, 15)
E a tile (10, 15) deixa de ter destaque
E apenas uma tile permanece destacada
```

### CA3: Clique fora do mapa não seleciona tile inválida
```gherkin
Dado que existe uma tile selecionada
Quando clico numa zona do ecrã que não corresponde a nenhuma tile do mundo
Então nenhuma tile com coordenada fora de 0..63 fica selecionada
E a selecção anterior é limpa 🔶
```

### CA4: Fronteira entre tiles é determinística
```gherkin
Dado que estou na ferramenta Select
Quando clico exactamente no bordo partilhado pelas tiles (4, 4) e (5, 4)
Então exactamente uma das duas tiles fica selecionada
E cliques repetidos no mesmo pixel selecionam sempre a mesma tile
```

### CA5: Selecção sobrevive a pan/zoom
```gherkin
Dado que a tile (20, 20) está selecionada
Quando faço pan e zoom
Então a tile (20, 20) continua selecionada
E o destaque acompanha a posição dessa tile no canvas
```

## 5. Fora do escopo

- Painel de inspecção com atributos (US-206).
- Selecção em área (rectângulo) — só tile única.
- Selecção de edifício como entidade distinta (o clique no edifício seleciona a tile de origem nesta US).
- Touch / long-press.

## 6. Dependências

- **Bloqueia:** US-201, US-206
- **Bloqueada por:** US-101 (transformação ecrã → mundo), US-102 (tiles existem)
- **Relacionada:** US-104 (grid ajuda a verificar o destaque)

## 7. Requisitos não-funcionais

- **Performance:** picking em O(1) via coordenadas (não varrer 4096 tiles).
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** o destaque não pode depender só da cor; incluir contorno visível. ❓ navegação por teclado (setas) fica em aberto.
- **Observabilidade:** coordenada da tile selecionada visível no debug (US-104) ou no HUD mínimo.
- **Internacionalização:** sem copy obrigatória nesta US.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN5 confirmado: clique fora **limpa** vs **mantém** selecção
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes da conversão cursor → tile (centro, bordo, fora do mapa) a passar sem browser
- [ ] Critérios de aceitação validados no canvas
- [ ] Destaque desenhado no Canvas, não como componente React por tile
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 CA3: clique fora **limpa** a selecção (mais previsível para ferramentas seguintes). Alternativa: manter.
- 🔶 Ferramenta Select é a predefinição ao entrar no jogo.
- ❓ Setas do teclado para mover a selecção entram no MVP de E1?
