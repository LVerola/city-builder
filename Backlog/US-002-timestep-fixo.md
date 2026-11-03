# US-002: Avançar a simulação em timestep fixo

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** que o tempo simulado avance em ticks fixos, independentes do FPS de tela,
**para que** o jogo se comporte igual em máquinas diferentes e a simulação possa ser testada sem interface.

## 2. Contexto e justificativa

Se o update da cidade andar preso ao `requestAnimationFrame`, uma máquina a 30 FPS simula metade da outra a 60. A arquitetura (seções 5–6) separa render (~60 FPS) de simulação (**20 ticks/s**).

Esta US é o coração do laboratório **e o momento em que nasce** `packages/game-core` (não existiu na US-001 de propósito: zero packages mortos). O `GameLoop` vive nesse package, corre headless (Vitest) e também no browser em `/jogo`. Ainda não há população nem mapa — o tick pode ser um contador — mas o contrato “N ticks em tempo T” tem de ser falsoável.

O anfitrião (`apps/web`) injeta o callback de render. Assim o core avança ticks e pede um desenho, sem conhecer Canvas, React ou Next.

Métrica de sucesso: um teste sem canvas avança exatamente 20 ticks num segundo simulado a 1×; no browser, reduzir o FPS de render não reduz a contagem de ticks no mesmo intervalo de relógio de jogo.

## 3. Regras de negócio

- RN1: A simulação avança em **timestep fixo** de **20 ticks por segundo** de tempo de jogo a velocidade 1×.
- RN2: O render pode ocorrer a uma frequência diferente (alvo 60 FPS no browser) e **não** determina quantos ticks acontecem.
- RN3: O loop da engine é independente do ciclo de renderização do React (o React não é o scheduler da simulação).
- RN4: É possível executar N ticks **headless**, sem canvas, sem `requestAnimationFrame` e sem React.
- RN5: Acumulador de frame: se um frame de render atrasar, a engine aplica **vários** ticks nesse intervalo, até **5 ticks por frame**. O tempo que exceder 5×dt é **descartado** (o jogo abranda em vez de spiral of death). O resto menor que 1 tick permanece no acumulador para o frame seguinte.
- RN6: Com a simulação em pausa (US-003), o render pode continuar; a contagem de ticks não aumenta.
- RN7: O passo **Render** do loop chama um **callback injetado** pelo anfitrião. `game-core` não importa Canvas, DOM, React, Next nem HTTP.
- RN8: Os testes desta US ficam em `packages/game-core`. `game-test-utils` não se cria aqui.

## 4. Critérios de aceitação (Gherkin)

### CA1: 20 ticks por segundo simulado a 1×
```gherkin
Dado um GameLoop headless em velocidade 1×
Quando avanço 1,00 segundo de tempo de jogo
Então a simulação executou exatamente 20 ticks
E um contador de ticks exposto pela engine vale 20
```

### CA2: Headless sem UI
```gherkin
Dado apenas o package game-core e o runner de testes Vitest nesse package
Quando corro a suite que avança o loop
Então os testes passam sem criar canvas
E sem importar react ou next
E não existe o package game-test-utils
```

### CA3: FPS de render não dita a simulação
```gherkin
Dado um GameLoop headless a 1×
Quando injeto intervalos de frame irregulares (dt variável) que somam 1,00 segundo de tempo de jogo
Então a simulação executou 20 ticks
E o número de invocações do callback de render pode ser diferente de 20
```

> CA3 no browser (máquina lenta vs 60 FPS) é **verificação manual**. Não há teste Playwright nesta US.

### CA4: Teto de ticks por frame
```gherkin
Dado que um único frame de render representa um atraso equivalente a 20 ticks
Quando o loop processa esse frame
Então aplica no máximo 5 ticks nesse frame
E o tempo equivalente aos 15 ticks excedentes é descartado
E um resto menor que 1 tick, se existir, permanece no acumulador
```

### CA5: React não agenda a simulação
```gherkin
Dado que /jogo hospeda o canvas
Quando a engine está a correr
Então os ticks não são disparados por um useEffect a cada render do React como relógio principal
E pausar o React DevTools re-render da árvore HUD não pára os ticks por si só
```

### CA6: Render por callback injetado
```gherkin
Dado o GameLoop em game-core
Quando o anfitrião regista um callback de render e o loop avança um frame
Então o callback é invocado depois dos ticks desse frame
E o código de game-core não referencia canvas, document nem window para desenhar
```

## 5. Fora do escopo

- Relógio de calendário (ano/mês/dia/hora) e botões de velocidade — US-003 (o loop pode expor pausa como flag mínima para RN6).
- Câmera, input, mapa, sistemas econômicos.
- Interpolação visual entre ticks.
- Worker thread / offscreen canvas.
- Testes E2E com Playwright (vêm depois).
- Package `game-test-utils`.

## 6. Dependências

- **Bloqueia:** US-003, US-004, US-101, US-104
- **Bloqueada por:** US-001 (`apps/web`, menu `/`, canvas em `/jogo`)
- **Relacionada:** US-104 (TPS no overlay)

## 7. Requisitos não-funcionais

- **Performance:** o loop vazio (só contador) não satura um núcleo no mapa ainda inexistente; alvo de render 60 FPS com placeholder.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** não há UI nova obrigatória nesta US.
- **Observabilidade:** a engine expõe ticks acumulados e TPS para testes e para o debug futuro.
- **Internacionalização:** não aplicável a copy; identificadores internos em código do core alinhados ao módulo.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-10-01)
- [x] RN5 fechado: teto **5** ticks/frame; excesso acima do teto **descartado**
- [x] Vitest no `game-core`; sem `game-test-utils`
- [x] Render por callback injetado (RN7)
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes Vitest em `packages/game-core` dos CA1, CA2, CA3 (dt variável), CA4 e CA6 a passar
- [ ] Demo no browser em `/jogo`: placeholder a “viver” com o loop (ex.: contador visível ou cor a pulsar **sem** ser o relógio de simulação)
- [ ] CA3 no browser validado manualmente
- [ ] `packages/game-core` criado nesta US e sem React/Canvas/HTTP
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Teto de **5 ticks/frame** fechado. Excesso acima de 5×dt é descartado; resto menor que 1 tick fica no acumulador.
- CA3 automatizado = dt variável headless. Checagem visual no browser é manual. **Playwright fica para uma US posterior.**
- Render = callback injetado pelo anfitrião (`apps/web`). O core não conhece Canvas.
- Testes desta US ficam em `packages/game-core`. `game-test-utils` só nasce na US que o preencher.
