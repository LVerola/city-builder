# US-104: Diagnosticar o mapa no modo debug

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** ligar um overlay de debug no mapa,
**para que** consiga ver FPS, ticks de simulação, semente, zoom e a estrutura de chunks sem adivinhar se o culling está a funcionar.

## 2. Contexto e justificativa

Este repositório é também um laboratório de performance. Sem números na tela, E1 fecha “a olho”: um mapa pequeno esconde leaks de render e erros de fronteira de chunk.

A arquitetura (seção 48) prevê `F1` para o modo debug e overlays de grid / limites de chunk. Trazer isto cedo evita construir E2 em cima de um renderer opaco.

Métrica de sucesso: com `F1`, o desenvolvedor lê FPS, TPS, semente, zoom, tile selecionada e chunks visíveis, e vê a grade alinhada às tiles.

## 3. Regras de negócio

- RN1: A tecla **F1** liga e desliga o modo debug (toggle). Se o ambiente (DevTools / Cursor) capturar F1, o fallback documentado é a tecla **\`** (backtick). Apenas um dos dois precisa de funcionar no ambiente da equipe; F1 é o preferido.
- RN2: Com o debug ligado, o overlay mostra pelo menos: **FPS de render**, **TPS da simulação**, **número de chunks visíveis**, **dimensão do mapa**, **semente**, **zoom da câmera**, **tile selecionada** (coordenada ou “nenhuma”).
- RN3: Overlays cartográficos iniciais: **grade de tiles** e **limites de chunk**.
- RN4: Ligar ou desligar o debug **não** altera o estado do mundo nem o relógio do jogo.
- RN5: O overlay é desenhado no Canvas (camada de overlay), não como milhares de nós React.
- RN6: O modo inicia **desligado** em cada sessão.
- RN7: Overlays de eletricidade, água, tráfego, poluição, etc. **não** entram nesta US — só quando esses sistemas existirem.

## 4. Critérios de aceitação (Gherkin)

### CA1: Ligar o overlay com F1
```gherkin
Dado que o modo debug está desligado
Quando pressiono F1 (ou o fallback ` se F1 estiver capturado)
Então o overlay de debug fica visível
E apresenta FPS, TPS, chunks visíveis, dimensão do mapa, semente, zoom e tile selecionada
E a grade de tiles está alinhada às tiles do mundo
```

### CA2: Desligar o overlay
```gherkin
Dado que o modo debug está ligado
Quando pressiono F1 (ou o fallback)
Então o overlay desaparece
E o terreno continua visível
E nenhuma tile muda de tipo
```

### CA3: Limites de chunk coincidem com a partição 32×32
```gherkin
Dado que o modo debug está ligado
E o mapa é 64×64 com chunks 32×32
Quando observo os limites de chunk
Então vejo as fronteiras em x=32 e y=32
E existem 4 retângulos de chunk no mapa completo
```

### CA4: Contadores não estão congelados
```gherkin
Dado que o modo debug está ligado
E o jogo está a correr em 1×
Quando espero pelo menos 1 segundo
Então o valor de FPS é atualizado
E o valor de TPS reflete a simulação em timestep fixo (não o FPS)
```

### CA5: Debug não interfere com a seleção
```gherkin
Dado que o modo debug está ligado
E a ferramenta Select está ativa
Quando clico numa tile
Então a tile é selecionada como na US-103
E o overlay permanece visível
E a coordenada no overlay passa a ser essa tile
```

### CA6: Zoom e semente visíveis
```gherkin
Dado que o modo debug está ligado
E a seed da sessão é 123456
Quando altero o zoom da câmera
Então o overlay mostra a semente 123456
E o valor de zoom reflete o zoom atual (entre 0,5× e 4×)
Quando nenhuma tile está selecionada
Então o overlay indica que não há tile selecionada
```

## 5. Fora do escopo

- Heatmaps de poluição, tráfego, felicidade, valor do solo (pós-MVP).
- Painel com checkboxes para cada overlay (grid + chunks sempre ligados com F1).
- Overlays de eletricidade / água / tráfego.
- Contagem de população/edifícios ainda inexistentes (mostrar 0 é aceitável).
- Profiler de CPU/GPU, Flamegraph.

## 6. Dependências

- **Bloqueia:** nenhuma US deste lote (facilita E2, não a bloqueia)
- **Bloqueada por:** US-102
- **Relacionada:** US-002 (TPS), US-003 (calendário), US-004 (seed), US-101 (zoom/posição), US-103 (coordenada selecionada)

## 7. Requisitos não-funcionais

- **Performance:** o overlay não deve, por si, derrubar o alvo de 60 FPS no mapa 64×64.
- **Segurança/Privacidade:** não aplicar; não logar dados pessoais.
- **Acessibilidade:** texto do overlay com contraste suficiente sobre o terreno; fonte legível (tamanho mínimo ~12px).
- **Observabilidade:** esta US *é* a observabilidade de E1.
- **Internacionalização:** labels do overlay em **PT-BR** (`FPS`, `Simulação`, `Chunks visíveis`, `Mapa`, `Semente`, `Zoom`, `Tile`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] F1 preferido; fallback \` se o ambiente capturar F1
- [x] Overlays de infra ficam para os sistemas existirem
- [x] Overlay inclui semente, zoom e tile selecionada neste lote
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Teste de toggle (ligado/desligado não muta o mundo) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- F1 preferido; se colidir com DevTools/Cursor, fallback **\`** — proposta **aceito**.
- Overlays de eletricidade/água/tráfego: **depois**, quando os sistemas existirem.
- **Semente** no overlay: sim (contrato da seed na US-004).
- Tile selecionada e zoom da câmera no overlay: **sim**, neste lote.
