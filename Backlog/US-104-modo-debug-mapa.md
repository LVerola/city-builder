# US-104: Diagnosticar o mapa no modo debug

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** ligar um overlay de debug no mapa,
**para que** consiga ver FPS, ticks de simulação e a estrutura de chunks sem adivinhar se o culling está a funcionar.

## 2. Contexto e justificativa

Este repositório é também um laboratório de performance. Sem números no ecrã, E1 fecha “no olhómetro”: um mapa pequeno esconde leaks de render e erros de fronteira de chunk.

A arquitectura (secção 48) prevê `F1` para o modo debug e overlays de grid / limites de chunk. Trazer isto cedo evita construir E2 em cima de um renderer opaco.

Métrica de sucesso: com `F1`, o desenvolvedor lê FPS, TPS da simulação e chunks visíveis, e vê a grelha alinhada às tiles.

## 3. Regras de negócio

- RN1: A tecla **F1** liga e desliga o modo debug (toggle).
- RN2: Com o debug ligado, o overlay mostra pelo menos: **FPS de render**, **TPS da simulação**, **número de chunks visíveis**, **dimensão do mapa**.
- RN3: Overlays cartográficos iniciais: **grelha de tiles** e **limites de chunk**.
- RN4: Ligar ou desligar o debug **não** altera o estado do mundo nem o relógio do jogo.
- RN5: O overlay é desenhado no Canvas (camada de overlay), não como milhares de nós React.
- RN6: 🔶 O modo inicia **desligado** em cada sessão.

## 4. Critérios de aceitação (Gherkin)

### CA1: Ligar o overlay com F1
```gherkin
Dado que o modo debug está desligado
Quando pressiono F1
Então o overlay de debug fica visível
E apresenta FPS, TPS, chunks visíveis e dimensão do mapa
E a grelha de tiles está alinhada às tiles do mundo
```

### CA2: Desligar o overlay
```gherkin
Dado que o modo debug está ligado
Quando pressiono F1
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
E existem 4 rectângulos de chunk no mapa completo
```

### CA4: Contadores não estão congelados
```gherkin
Dado que o modo debug está ligado
E o jogo está a correr em 1×
Quando espero pelo menos 1 segundo
Então o valor de FPS é actualizado
E o valor de TPS reflecte a simulação em timestep fixo (não o FPS)
```

### CA5: Debug não interfere com a selecção
```gherkin
Dado que o modo debug está ligado
E a ferramenta Select está activa
Quando clico numa tile
Então a tile é selecionada como na US-103
E o overlay permanece visível
```

## 5. Fora do escopo

- Heatmaps de poluição, tráfego, felicidade, valor do solo (pós-MVP).
- Painel com checkboxes para cada overlay (pode ser hardcoded: grid + chunks sempre ligados com F1).
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
- **Internacionalização:** labels do overlay em **PT-BR** (`FPS`, `Simulação`, `Chunks visíveis`, `Mapa`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Lista mínima de métricas (RN2) confirmada
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Teste de toggle (ligado/desligado não muta o mundo) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 F1 no browser pode colidir com atalhos do DevTools / Cursor; se colidir no ambiente da equipa, o refinement escolhe outro atalho (ex.: `` ` ``) sem mudar o resto da US.
- 🔶 Overlays de electricidade/água/tráfego ficam para quando esses sistemas existirem.
- ❓ O overlay deve mostrar também a tile selecionada e o zoom da câmara já em E1?
