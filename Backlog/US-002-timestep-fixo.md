# US-002: Avançar a simulação em timestep fixo

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** que o tempo simulado avance em ticks fixos, independentes do FPS de ecrã,
**para que** o jogo se comporte igual em máquinas diferentes e a simulação possa ser testada sem interface.

## 2. Contexto e justificativa

Se o update da cidade andar preso ao `requestAnimationFrame`, uma máquina a 30 FPS simula metade da outra a 60. A arquitectura (secções 5–6) separa render (~60 FPS) de simulação (**20 ticks/s**).

Esta US é o coração do laboratório: o `GameLoop` vive em `game-core`, corre headless (Vitest) e também no browser. Ainda não há população nem mapa — o tick pode ser um contador — mas o contrato “N ticks em tempo T” tem de ser falsoável.

Métrica de sucesso: um teste sem canvas avança exactamente 20 ticks num segundo simulado a 1×; no browser, reduzir o FPS de render não reduz a contagem de ticks no mesmo intervalo de relógio de jogo.

## 3. Regras de negócio

- RN1: A simulação avança em **timestep fixo** de **20 ticks por segundo** de tempo de jogo a velocidade 1×.
- RN2: O render pode ocorrer a uma frequência diferente (alvo 60 FPS no browser) e **não** determina quantos ticks acontecem.
- RN3: O loop da engine é independente do ciclo de renderização do React (o React não é o scheduler da simulação).
- RN4: É possível executar N ticks **headless**, sem canvas, sem `requestAnimationFrame` e sem React.
- RN5: Acumulador de frame: se um frame de render atrasar, a engine aplica **vários** ticks de simulação nesse intervalo, até um tecto 🔶 de **5 ticks por frame** para evitar spiral of death.
- RN6: Com a simulação em pausa (US-003), o render pode continuar; a contagem de ticks não aumenta.

## 4. Critérios de aceitação (Gherkin)

### CA1: 20 ticks por segundo simulado a 1×
```gherkin
Dado um GameLoop headless em velocidade 1×
Quando avanço 1,00 segundo de tempo de jogo
Então a simulação executou exactamente 20 ticks
E um contador de ticks exposto pela engine vale 20
```

### CA2: Headless sem UI
```gherkin
Dado apenas o package game-core e o runner de testes
Quando corro a suite que avança o loop
Então os testes passam sem criar canvas
E sem importar react ou next
```

### CA3: FPS de render não dita a simulação
```gherkin
Dado o jogo aberto no browser em velocidade 1×
Quando o render corre a uma cadência inferior ao alvo (por exemplo, máquina lenta)
Então no mesmo segundo de tempo de jogo a engine continua a aplicar 20 ticks
E o número de frames desenhados pode ser diferente de 20
```

### CA4: Tecto de ticks por frame
```gherkin
Dado que um único frame de render representa um atraso equivalente a 20 ticks
Quando o loop processa esse frame
Então aplica no máximo 5 ticks nesse frame 🔶
E o tempo simulado não “salta” o resto nesse mesmo frame (o excesso fica no acumulador ou é descartado de forma documentada)
```

### CA5: React não agenda a simulação
```gherkin
Dado que a página hospeda o canvas
Quando a engine está a correr
Então os ticks não são disparados por um useEffect a cada render do React como relógio principal
E pausar o React DevTools re-render da árvore HUD não pára os ticks por si só
```

## 5. Fora do escopo

- Relógio de calendário (ano/mês/dia/hora) e botões de velocidade — US-003 (o loop pode expor pausa como flag mínima para RN6).
- Câmara, input, mapa, sistemas económicos.
- Interpolação visual entre ticks.
- Worker thread / offscreen canvas.

## 6. Dependências

- **Bloqueia:** US-003, US-004, US-101, US-104
- **Bloqueada por:** US-001
- **Relacionada:** US-104 (TPS no overlay)

## 7. Requisitos não-funcionais

- **Performance:** o loop vazio (só contador) não satura um núcleo no mapa ainda inexistente; alvo de render 60 FPS com placeholder.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** não há UI nova obrigatória nesta US.
- **Observabilidade:** a engine expõe ticks acumulados e TPS para testes e para o debug futuro.
- **Internacionalização:** não aplicável a copy; identificadores internos em código do core alinhados ao módulo.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN5: excesso de ticks — buffer vs descarte — confirmado
- [ ] Vitest no workspace acordado (já na US-001 ou nesta)
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes Vitest headless dos CA1, CA2 e CA4 a passar
- [ ] Demo no browser: placeholder a “viver” com o loop (ex.: contador visível ou cor a pulsar **sem** ser o relógio de simulação)
- [ ] Critérios de aceitação validados
- [ ] `game-core` continua sem React/Canvas/HTTP
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Tecto de 5 ticks/frame (CA4) é o teto clássico para spiral of death; o refinement pode escolher 3–8.
- 🔶 CA3 no browser é difícil de automatizar cedo: aceite teste manual + teste headless que injeta dt variável. Playwright pode vir depois.
- ❓ O passo de “Render” no loop chama um callback injectado pela app (inversão de dependência) — é o desenho correcto para a engine não conhecer Canvas.
- ❓ `game-test-utils` nasce aqui ou os testes ficam junto de `game-core` até haver segundo consumidor?
