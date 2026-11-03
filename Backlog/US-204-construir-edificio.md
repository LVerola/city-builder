# US-204: Construir edifício a partir de definição

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** colocar um edifício escolhido de um catálogo pequeno,
**para que** ocupe tiles no mapa com tamanho e categoria definidos por dados, não por código rígido.

## 2. Contexto e justificativa

A arquitetura insiste que prédios são **dirigidos por dados** (`game-content`) e que o React **não** monta um componente por prédio. E2 precisa de 2–3 definições reais para provar os dois princípios antes da simulação econômica.

Colocar um edifício de 2×2 valida ocupação de tiles e rejeição fora do mapa. Custo no JSON existe; **debitar dinheiro é E3**. Zona **não** é pré-requisito neste sandbox.

## 3. Regras de negócio

- RN1: Existem pelo menos **três** definições em `game-content`: uma residencial, uma comercial ou industrial, e uma de serviço ou fábrica — `id` estável.
- RN2: Cada definição declara `size.width` e `size.height` em tiles.
- RN3: A âncora é a tile clicada; o edifício ocupa o retângulo âncora + tamanho, crescendo para **+x e +y** (origem do mapa no topo-esquerdo).
- RN4: Colocação é recusada se qualquer tile do retângulo estiver fora do mapa, tiver **edifício**, tiver **estrada**, ou for `water` / `mountain`.
- RN5: Colocação **não** exige zona compatível neste lote. Pode ir para grass/sand/forest vazia.
- RN6: A ação é um comando da engine; o catálogo é lido de `game-content` (package criado nesta US).
- RN7: O canvas desenha o edifício como **volume colorido por categoria** (não React por instância). Sprites de edifício não são obrigatórios.
- RN8: `cost` / `constructionCost` existem na definição e **não** debitam tesouro.
- RN9: Enquanto a ferramenta Construir está ativa, um **ghost/preview** do retângulo segue o cursor. O preview **não** muta o mundo. Preview inválido usa visual de recusa (sem colocar ao clicar).

## 4. Critérios de aceitação (Gherkin)

### CA1: Colocar edifício 2×2 em tiles vazias
```gherkin
Dado que a ferramenta Construir está ativa
E a definição "residential_small_01" tem tamanho 2×2
E as tiles (10, 10), (11, 10), (10, 11) e (11, 11) são grass vazias
Quando clico na tile (10, 10)
Então um edifício com esse id ocupa as quatro tiles
E o canvas mostra o volume nessa área
E nenhuma dessas tiles aceita outro edifício
```

### CA2: Recusar sobreposição ou fora do mapa
```gherkin
Dado que a ferramenta Construir está ativa com um edifício 2×2
E estou a apontar para a tile (63, 63) no canto do mapa
Quando clico para construir
Então nenhum edifício é criado
E recebo feedback de recusa
```

### CA3: Recusar tile com estrada; zona não é obrigatória
```gherkin
Dado um edifício 2×2 seleccionado
E a tile (8, 8) tem estrada
Quando clico em (8, 8) como âncora
Então o comando é recusado
E a estrada permanece
Dado grass vazia sem zona em (4, 4)
Quando clico com a mesma definição
Então o edifício é criado
```

### CA4: Catálogo dirigido por dados
```gherkin
Dado que as definições de edifício estão nos dados de conteúdo
Quando o jogo arranca
Então a paleta de construção lista os edifícios a partir dessas definições
E remover ou adicionar uma definição no conteúdo altera a paleta sem mudar a regra de colocação
```

### CA5: Comando headless
```gherkin
Dado um mundo sem UI e a definição 2×2 carregada
Quando a engine executa o comando de construir na âncora (0, 0)
Então existe um edifício com id gerado, tipo da definição e âncora (0, 0)
E as quatro tiles referenciam esse edifício
E um evento de edifício construído é emitido
```

### CA6: Ghost/preview sob o cursor
```gherkin
Dado que a ferramenta Construir está ativa com um edifício 2×2
Quando movo o cursor sobre tiles válidas sem clicar
Então o canvas mostra o retângulo previsto (2×2) a partir da âncora
E nenhuma tile do mundo muda
Quando o retângulo fica inválido (estrada ou fora do mapa)
Então o preview indica recusa
E clicar não cria edifício
```

## 5. Fora do escopo

- Consumo de dinheiro, manutenção, empregados, eletricidade, água.
- Construção com tempo (andaime / dias de obra).
- Rotação do edifício.
- Catálogo completo; apenas 3 definições.
- Upgrade de nível jogável.
- Sprites de edifício (volume colorido basta).
- Exigir zona compatível (E3, se fizer falta).

## 6. Dependências

- **Bloqueia:** US-205, US-206
- **Bloqueada por:** US-202 (não sobrepor estrada), US-201 (paleta)
- **Relacionada:** US-203 (zona visível, não obrigatória)

## 7. Requisitos não-funcionais

- **Performance:** dezenas de edifícios no mapa 64×64 sem lista React de entidades.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** cada item do catálogo tem nome em PT-BR + dimensão (ex.: `Casa pequena (2×2)`).
- **Observabilidade:** motivo de recusa testável (`FORA_DO_MAPA`, `SOBREPOSICAO`, `TERRENO_INVALIDO`).
- **Internacionalização:** nomes visíveis em PT-BR; `id` técnico em inglês estável.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Âncora topo-esquerdo (+x, +y)
- [x] Zona não é pré-requisito
- [x] Visual: volume colorido por categoria
- [x] Ghost/preview **incluído** nesta US
- [ ] Três ids concretos no refinement de conteúdo (podem nascer com o JSON)
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] `packages/game-content` criado e preenchido com as 3 definições
- [ ] Testes headless de colocação, recusa e âncora a passar
- [ ] Critérios de aceitação validados no browser (inclui preview)
- [ ] Zero componentes React por instância de edifício
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Âncora canto superior-esquerdo (+x, +y): **aceito**.
- Zona **não** é pré-requisito: aceito.
- Visual mínimo: **volume colorido por categoria**: aceito.
- Ghost/preview sob o cursor: **incluído nesta US**.
