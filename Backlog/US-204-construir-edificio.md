# US-204: Construir edifício a partir de definição

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** colocar um edifício escolhido de um catálogo pequeno,
**para que** ocupe tiles no mapa com tamanho e categoria definidos por dados, não por código rígido.

## 2. Contexto e justificativa

A arquitectura insiste que prédios são **dirigidos por dados** (`game-content`) e que o React **não** monta um componente por prédio. E2 precisa de 2–3 definições reais para provar os dois princípios antes da simulação económica.

Colocar um edifício de 2×2 também valida ocupação de tiles, rejeição fora do mapa e convivência com estradas. Custo no JSON existe para o conteúdo nascer completo; **debitar dinheiro é E3**.

Métrica de sucesso: o jogador escolhe “Casa pequena”, clica um sítio válido, vê o volume no canvas, e um teste headless constrói o mesmo a partir do JSON sem UI.

## 3. Regras de negócio

- RN1: Existem pelo menos **três** definições em dados (não hardcoded na lógica de colocação): uma residencial, uma comercial ou industrial, e uma de serviço ou fábrica — identificadas por `id` estável.
- RN2: Cada definição declara `size.width` e `size.height` em tiles.
- RN3: A âncora da colocação é a tile clicada; o edifício ocupa o rectângulo âncora + tamanho, 🔶 crescendo para +x e +y.
- RN4: Colocação é recusada se qualquer tile do rectângulo estiver fora do mapa, tiver **edifício**, tiver **estrada**, ou for `water` / `mountain`.
- RN5: 🔶 Colocação **não** exige zona compatível neste lote (sandbox). Zona é informação visual; a restrição pode ligar-se em E3.
- RN6: A acção é um comando da engine; o catálogo é lido de `game-content`.
- RN7: O canvas desenha o edifício; a lista de entidades **não** é renderizada em React.
- RN8: Campos `cost` / `constructionCost` existem na definição mas **não** alteram nenhum tesouro nesta US.

## 4. Critérios de aceitação (Gherkin)

### CA1: Colocar edifício 2×2 em tiles vazias
```gherkin
Dado que a ferramenta Construir está activa
E a definição "residential_small_01" tem tamanho 2×2
E as tiles (10, 10), (11, 10), (10, 11) e (11, 11) são grass vazias
Quando clico na tile (10, 10)
Então um edifício com esse id ocupa as quatro tiles
E o canvas mostra o edifício nessa área
E nenhuma dessas tiles aceita outro edifício
```

### CA2: Recusar sobreposição ou fora do mapa
```gherkin
Dado que a ferramenta Construir está activa com um edifício 2×2
E estou a apontar para a tile (63, 63) no canto do mapa
Quando clico para construir
Então nenhum edifício é criado
E recebo feedback de recusa
```

### CA3: Recusar tile com estrada
```gherkin
Dado um edifício 2×2 seleccionado
E a tile (8, 8) tem estrada
Quando clico em (8, 8) como âncora
Então o comando é recusado
E a estrada permanece
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

## 5. Fora do escopo

- Consumo de dinheiro, manutenção, empregados, electricidade, água.
- Construção com tempo (andaime / dias de obra).
- Rotação do edifício.
- Catálogo completo de cidade; apenas 3 definições.
- Upgrade de nível (`level`) jogável.

## 6. Dependências

- **Bloqueia:** US-205, US-206
- **Bloqueada por:** US-202 (regra de não sobrepor estrada), US-201 (paleta)
- **Relacionada:** US-203 (zona visível por baixo / ao lado; não obrigatória — RN5)

## 7. Requisitos não-funcionais

- **Performance:** dezenas de edifícios no mapa 64×64 sem lista React de entidades.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** cada item do catálogo tem nome em PT-BR + dimensão (ex.: `Casa pequena (2×2)`).
- **Observabilidade:** motivo de recusa testável (`FORA_DO_MAPA`, `SOBREPOSICAO`, `TERRENO_INVALIDO`).
- **Internacionalização:** nomes visíveis em PT-BR; `id` técnico em inglês estável (`residential_small_01`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Três definições concretas acordadas (ids + tamanhos)
- [ ] RN5 (zona obrigatória ou não) confirmado
- [ ] Visual mínimo: rectângulo colorido por categoria vs sprite
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless de colocação e recusa a passar
- [ ] JSON/dados de conteúdo versionados no repo
- [ ] Critérios de aceitação validados no browser
- [ ] Zero componentes React por instância de edifício
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Âncora no canto superior-esquerdo (+x, +y). Mapas com origem no topo-esquerdo.
- 🔶 Zona não é pré-requisito de colocação neste sandbox (RN5). Se o refinement quiser o contrário, vira RN e um CA extra — ainda cabe se se remover CA4 da UI para o conteúdo.
- 🔶 Visual mínimo: volume colorido por categoria, como o terreno em E1.
- ❓ Ghost/preview do rectângulo sob o cursor antes do clique — incluir nesta US ou na de inspecção?
