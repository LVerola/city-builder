# US-102: Visualizar terreno em tiles e chunks

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** ver o mapa dividido em tiles com tipos de terreno distintos,
**para que** reconheça relevo, água e floresta antes de construir.

## 2. Contexto e justificativa

Um mapa navegável sem terreno é só um rectângulo vazio. O jogador precisa de distinguir relva, água, floresta, montanha e areia para as ferramentas de construção fazerem sentido.

O mundo vive na engine (`game-world`), não no React. O mapa nasce já em chunks para o renderer só desenhar o que está no viewport — fundamento de performance da arquitectura (secções 10 e 43), mesmo no mapa inicial 64×64.

Métrica de sucesso: ao abrir o jogo, o jogador vê um mapa 64×64 com os cinco tipos de terreno, e ao fazer pan os chunks fora da vista deixam de ser desenhados.

## 3. Regras de negócio

- RN1: O mapa inicial tem **64×64** tiles.
- RN2: O mapa está particionado em chunks de **32×32** tiles (4 chunks no mapa inicial).
- RN3: Cada tile tem exactamente um tipo de terreno: `grass`, `water`, `forest`, `mountain` ou `sand`.
- RN4: O mapa inicial contém **pelo menos uma tile** de cada um dos cinco tipos.
- RN5: O renderer desenha apenas chunks que intersectam o viewport (culling).
- RN6: Tiles **não** são componentes React; o Canvas é o único responsável pelo mundo.
- RN7: 🔶 Visual mínimo aceite: cor (ou padrão) distinta e estável por tipo de terreno. Sprites são desejáveis mas não obrigatórios para fechar a US.

## 4. Critérios de aceitação (Gherkin)

### CA1: Mapa inicial visível com os cinco terrenos
```gherkin
Dado que o jogo acabou de abrir
Quando o canvas apresenta o mundo
Então vejo um mapa com 64 tiles de largura e 64 de altura
E existem tiles visíveis dos tipos grass, water, forest, mountain e sand
E cada tipo tem uma aparência distinta das outras
```

### CA2: Culling de chunks ao navegar
```gherkin
Dado que a câmara mostra apenas o canto superior esquerdo do mapa
Quando consulto o modo debug (ou o contador de chunks visíveis)
Então o número de chunks enviados ao renderer é menor do que o total de chunks do mapa
Quando faço pan até o canto oposto
Então o conjunto de chunks visíveis muda
E os chunks que saíram do viewport deixam de ser desenhados
```

### CA3: Terreno pertence ao mundo, não ao React
```gherkin
Dado que o mapa tem 4096 tiles
Quando inspeciono a árvore de componentes da UI
Então não existe um componente React por tile nem por chunk
E o mundo continua visível no canvas
```

### CA4: Tipo de terreno inválido não derruba o jogo
```gherkin
Dado que uma tile do mundo recebe um tipo de terreno desconhecido
Quando o renderer desenha o chunk dessa tile
Então o jogo não crasha
E essa tile é desenhada com o visual de fallback 🔶 grass
E o restante do chunk permanece visível
```

### CA5: Tile na fronteira de dois chunks
```gherkin
Dado que existe uma tile na coordenada (31, 31) e outra em (32, 32)
Quando a câmara mostra a fronteira entre os quatro chunks
Então as duas tiles são desenhadas sem buraco e sem sobreposição
E cada uma pertence a exactamente um chunk
```

## 5. Fora do escopo

- Pintar terreno pelo jogador (US-201).
- Selecção de tile (US-103).
- Overlay de grid/chunks no debug (US-104); o culling em si é desta US.
- Streaming de mapa a partir de ficheiro ou servidor.
- Água animada, declives, mistura de tiles.

## 6. Dependências

- **Bloqueia:** US-103, US-104, US-201
- **Bloqueada por:** US-101 (precisa de viewport/câmara para o culling ser observável)
- **Relacionada:** US-002 (GameLoop), US-004 (seed se o mapa inicial for gerado)

## 7. Requisitos não-funcionais

- **Performance:** mapa 64×64 a 60 FPS de render com culling activo; simulação continua no timestep fixo.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** contraste entre os cinco visuais de terreno deve permitir distinguir os tipos (não basta tonalidades quase iguais).
- **Observabilidade:** número de chunks visíveis deve ser exposto ao debug (US-104).
- **Internacionalização:** nomes internos dos tipos permanecem os identificadores da arquitectura (`grass`, etc.); labels em PT-BR só no HUD (US-206).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Decisão visual: cores vs sprites (RN7)
- [ ] Algoritmo de geração do mapa inicial acordado (aleatório com seed vs mapa fixo de conteúdo)
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes do mundo (dimensão, chunks 32×32, pertença de tiles, tipo inválido) a passar sem canvas
- [ ] Critérios de aceitação validados no browser
- [ ] Nenhum componente React a representar tile/edifício
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Geração do mapa inicial: seed determinística que garante os cinco terrenos, para testes reproduzíveis.
- 🔶 Fallback de terreno inválido = `grass` (CA4).
- ❓ O mapa inicial é autoral (layout desenhado) ou gerado proceduralmente?
- ❓ Asset Manager com sprites de terreno entra nesta US ou fica para polish (RN7)?
