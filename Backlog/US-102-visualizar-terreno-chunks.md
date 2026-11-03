# US-102: Visualizar terreno em tiles e chunks

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** ver o mapa dividido em tiles com tipos de terreno distintos,
**para que** reconheça relevo, água e floresta antes de construir.

## 2. Contexto e justificativa

Um mapa navegável sem terreno é só um retângulo vazio. O jogador precisa de distinguir relva, água, floresta, montanha e areia para as ferramentas de construção fazerem sentido.

O mundo vive na engine (`game-world`), não no React. O mapa nasce já em chunks para o renderer só desenhar o que está no viewport — fundamento de performance da arquitetura (seções 10 e 43), mesmo no mapa inicial 64×64.

Esta US **preenche** `packages/game-world` e `packages/game-renderer` (incluindo o Asset Manager de terreno). Não se criam packages vazios noutro momento.

Métrica de sucesso: ao abrir `/jogo`, o jogador vê um mapa 64×64 gerado com a seed, com os cinco tipos de terreno em sprites, e ao fazer pan os chunks fora da vista deixam de ser desenhados.

## 3. Regras de negócio

- RN1: O mapa inicial tem **64×64** tiles.
- RN2: O mapa está particionado em chunks de **32×32** tiles (4 chunks no mapa inicial).
- RN3: Cada tile tem exatamente um tipo de terreno: `grass`, `water`, `forest`, `mountain` ou `sand`.
- RN4: O mapa inicial é **gerado** (não autoral) com a seed da US-004, de forma a incluir **pelo menos uma tile** de cada um dos cinco tipos. A mesma seed produz o mesmo mapa.
- RN5: O renderer desenha apenas chunks que intersectam o viewport (culling).
- RN6: Tiles **não** são componentes React; o Canvas é o único responsável pelo mundo.
- RN7: Cada tipo de terreno tem um **sprite** carregado pelo **Asset Manager** (carregar uma vez, reutilizar). Visual distinto e estável por tipo. Cor sólida só como fallback de asset em falta, não como visual feliz.
- RN8: Tipo de terreno desconhecido no mundo desenha-se como **`grass`** e não crasha o jogo.

## 4. Critérios de aceitação (Gherkin)

### CA1: Mapa gerado com os cinco terrenos
```gherkin
Dado que o jogo abre /jogo com a seed 123456
Quando o canvas apresenta o mundo
Então vejo um mapa com 64 tiles de largura e 64 de altura
E existem tiles visíveis dos tipos grass, water, forest, mountain e sand
E cada tipo usa o sprite correspondente
Quando abro de novo com a mesma seed
Então o mapa é idêntico
```

### CA2: Culling de chunks ao navegar
```gherkin
Dado que a câmera mostra apenas o canto superior esquerdo do mapa
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
E essa tile é desenhada com o visual de grass
E o restante do chunk permanece visível
```

### CA5: Tile na fronteira de dois chunks
```gherkin
Dado que existe uma tile na coordenada (31, 31) e outra em (32, 32)
Quando a câmera mostra a fronteira entre os quatro chunks
Então as duas tiles são desenhadas sem buraco e sem sobreposição
E cada uma pertence a exatamente um chunk
```

### CA6: Asset Manager carrega sprites uma vez
```gherkin
Dado que a página /jogo arrancou
Quando o terreno é desenhado em vários frames
Então os sprites dos cinco tipos foram pedidos ao Asset Manager
E não há um carregamento de imagem por tile nem por frame
Quando um sprite está em falta
Então essa tile usa a cor de fallback
E o resto do mapa continua visível
```

## 5. Fora do escopo

- Pintar terreno pelo jogador (US-201).
- Seleção de tile (US-103).
- Overlay de grid/chunks no debug (US-104); o culling em si é desta US.
- Streaming de mapa a partir de arquivo ou servidor.
- Água animada, declives, mistura de tiles.
- Mapa desenhado à mão (autoral).

## 6. Dependências

- **Bloqueia:** US-103, US-104, US-201
- **Bloqueada por:** US-101 (viewport/câmera), US-004 (seed)
- **Relacionada:** US-002 (GameLoop)

## 7. Requisitos não-funcionais

- **Performance:** mapa 64×64 a 60 FPS de render com culling ativo; simulação continua no timestep fixo; sprites em cache no Asset Manager.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** os cinco sprites devem distinguir-se entre si (não basta um único tile-sheet ilegível).
- **Observabilidade:** número de chunks visíveis exposto ao debug (US-104).
- **Internacionalização:** nomes internos dos tipos permanecem os identificadores da arquitetura (`grass`, etc.); labels em PT-BR só no HUD (US-206).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Visual: sprites via Asset Manager nesta US
- [x] Mapa inicial **gerado** com seed; fallback de tipo inválido = `grass`
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] `packages/game-world` e `packages/game-renderer` criados e preenchidos (não vazios)
- [ ] Testes do mundo (dimensão, chunks, pertença, tipo inválido, mesma seed → mesmo mapa) a passar sem canvas
- [ ] Critérios de aceitação validados no browser
- [ ] Nenhum componente React a representar tile/edifício
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Geração com seed determinística que garante os cinco terrenos: **aceito**.
- Fallback de terreno inválido = **`grass`**: aceito.
- Mapa inicial: **gerado**, não autoral.
- Asset Manager + sprites de terreno: **entram nesta US**.
