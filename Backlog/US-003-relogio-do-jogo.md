# US-003: Controlar o relógio do jogo

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** pausar e acelerar o tempo do mundo,
**para que** observe o calendário do jogo avançar no ritmo que escolho, sem mudar as regras da simulação.

## 2. Contexto e justificativa

A cidade ainda não vive, mas o tempo já tem de existir: E1 e E2 constroem em cima de um relógio único (`GameDate` + velocidades pausa / 1× / 2× / 4×, arquitetura seção 7). Se o relógio nascer só no HUD da US-206, cada sistema futuro inventa o seu.

A velocidade **multiplica a quantidade de tempo simulado**, não a lógica dos sistemas. Em E0 os “sistemas” são o avanço do calendário. O HUD completo fica para US-206; aqui basta o relógio na engine e um controle mínimo (atalhos + indicador).

Métrica de sucesso: em pausa o calendário congela e o canvas pode continuar a redesenhar; em 2× o calendário avança o dobro de 1× no mesmo tempo real.

## 3. Regras de negócio

- RN1: O mundo usa um calendário próprio: `year`, `month`, `day`, `hour` (`GameDate`).
- RN2: Velocidades permitidas: **pausado**, **1×**, **2×**, **4×**. Não há outras neste lote.
- RN3: Em pausa, os ticks de simulação não avançam o calendário; o render pode continuar.
- RN4: 1×, 2× e 4× alteram quantos ticks (ou quanto tempo de jogo) correm por segundo real; **não** alteram fórmulas de sistemas (ainda inexistentes).
- RN5: **20 ticks = 1 hora de jogo** a 1× (1 segundo real ≈ 1 hora de jogo a 1×, alinhado aos 20 ticks/s da US-002).
- RN6: Calendário **simplificado neste lote**: data inicial ano 1, mês 1, dia 1, hora 0; **meses com 30 dias**; 24 horas por dia. O calendário **gregoriano** (meses 28–31, anos bissextos) é requisito futuro documentado na arquitetura, seção 7 — não se implementa aqui. Código de avanço do tempo fica concentrado no relógio, sem espalhar “30 dias” pelos sistemas.
- RN7: Controle mínimo no anfitrião web, **só com o canvas focado**: **Espaço** pausa/retoma (retoma a última velocidade não pausada, default 1×); teclas **1**, **2**, **4** seleccionam a velocidade. Um indicador em PT-BR mostra data/hora e velocidade.
- RN8: O relógio vive na engine; a UI só envia pedidos de mudança de velocidade.
- RN9: A US-206 **não** reimplementa o relógio; só promove o controle para o HUD. Os atalhos desta US continuam a valer (com o canvas focado).

## 4. Critérios de aceitação (Gherkin)

### CA1: Calendário avança a 1×
```gherkin
Dado o jogo em velocidade 1× na data 1/1/1 00:00
Quando passam 20 ticks de simulação
Então o calendário mostra 1/1/1 01:00
```

### CA2: Pausa congela o tempo de jogo
```gherkin
Dado que estou em /jogo e o canvas tem foco
E o jogo está em 1×
Quando pressiono Espaço e o estado passa a pausado
E espero 1 segundo real
Então a data/hora do jogo permanece igual
E o canvas continua visível (não congela a página)
```

### CA3: 2× avança o dobro de 1×
```gherkin
Dado dois relógios headless no mesmo ponto de calendário
Quando o primeiro corre 1,00 segundo real a 1×
E o segundo corre 1,00 segundo real a 2×
Então o segundo avançou o dobro das horas de jogo do primeiro
```

### CA4: 4× e velocidades inválidas
```gherkin
Dado que estou em /jogo e o canvas tem foco
E o jogo está em 1×
Quando pressiono a tecla 4
Então a velocidade ativa é 4×
Quando o código tenta aplicar uma velocidade que não seja 0, 1, 2 ou 4
Então a velocidade anterior mantém-se
E a engine não crasha
```

### CA5: Indicador visível
```gherkin
Dado que estou em /jogo
Quando olho para o anfitrião web
Então vejo a data/hora do jogo em PT-BR
E vejo se está pausado, 1×, 2× ou 4×
Quando mudo a velocidade com o canvas focado
Então o indicador atualiza sem recarregar a página
```

### CA6: Atalhos só com o canvas focado
```gherkin
Dado que estou em /jogo
E o foco não está no canvas
Quando pressiono Espaço ou 1 ou 2 ou 4
Então a velocidade do jogo não muda
E o calendário continua no ritmo anterior
```

### CA7: Mês de 30 dias (modelo atual)
```gherkin
Dado o calendário em 1/1/1 23:00 a 1×
Quando passam 20 ticks
Então a data é 1/1/2 00:00
Dado o calendário em 1/1/30 23:00
Quando passam 20 ticks
Então a data é 1/2/1 00:00
```

## 5. Fora do escopo

- Painel HUD completo, inspeção de tiles, paleta de ferramentas (US-206, E2).
- Ciclo econômico mensal, população, impostos.
- Gravar/carregar a data.
- Velocidades extra (8×, 16×).
- Calendário gregoriano (meses variáveis, anos bissextos) — mapeado na arquitetura seção 7 como visão futura.
- Atalhos globais na página / no menu `/`.

## 6. Dependências

- **Bloqueia:** US-206 (o HUD reutiliza este relógio)
- **Bloqueada por:** US-002
- **Relacionada:** US-001 (indicador em `/jogo`), US-104 (TPS vs calendário)

## 7. Requisitos não-funcionais

- **Performance:** mudança de velocidade é O(1); não reinicia o mundo.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** atalhos documentados no indicador; só atuam com o canvas focado, para o Espaço não capturar a página inteira. O indicador é texto, não só ícone.
- **Observabilidade:** velocidade e `GameDate` consultáveis pela engine (debug futuro).
- **Internacionalização:** indicador em PT-BR (ex.: `Pausado`, `1×`, `Ano 1 · 1 jan · 00h`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-10-01)
- [x] RN5 fechado: 20 ticks = 1 hora de jogo
- [x] RN6 fechado: 30 dias/mês agora; gregoriano documentado na arquitetura §7
- [x] Atalhos: Espaço, 1, 2, 4; **só com o canvas focado**
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless de avanço, viragem de dia/mês (30 dias), pausa, 2×/4× e rejeição de velocidade inválida a passar
- [ ] Indicador + atalhos validados no browser em `/jogo` (com e sem foco no canvas)
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- **20 ticks = 1 hora de jogo** fechado.
- Meses de **30 dias** neste lote. O calendário **gregoriano** está mapeado como visão futura em `docs/architecture/city-builder-arquitetura-tecnica.md` (seção 7) — não se implementa aqui.
- US-206 não reimplementa o relógio; os atalhos desta US continuam (com canvas focado).
- Atalhos **só valem com o canvas focado**. Globais ficam para uma US posterior, se fizer falta.
