# US-003: Controlar o relógio do jogo

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** pausar e acelerar o tempo do mundo,
**para que** observe o calendário do jogo avançar no ritmo que escolho, sem mudar as regras da simulação.

## 2. Contexto e justificativa

A cidade ainda não vive, mas o tempo já tem de existir: E1 e E2 constroem em cima de um relógio único (`GameDate` + velocidades pausa / 1× / 2× / 4×, arquitectura secção 7). Se o relógio nascer só no HUD da US-206, cada sistema futuro inventa o seu.

A velocidade **multiplica a quantidade de tempo simulado**, não a lógica dos sistemas. Em E0 os “sistemas” são o avanço do calendário. O HUD completo fica para US-206; aqui basta o relógio na engine e um controlo mínimo (atalhos + indicador).

Métrica de sucesso: em pausa o calendário congela e o canvas pode continuar a redesenhar; em 2× o calendário avança o dobro de 1× no mesmo tempo real.

## 3. Regras de negócio

- RN1: O mundo usa um calendário próprio: `year`, `month`, `day`, `hour` (`GameDate`).
- RN2: Velocidades permitidas: **pausado**, **1×**, **2×**, **4×**. Não há outras neste lote.
- RN3: Em pausa, os ticks de simulação não avançam o calendário; o render pode continuar.
- RN4: 1×, 2× e 4× alteram quantos ticks (ou quanto tempo de jogo) correm por segundo real; **não** alteram fórmulas de sistemas (ainda inexistentes).
- RN5: 🔶 **20 ticks = 1 hora de jogo** a 1× (portanto 1 segundo real ≈ 1 hora de jogo a 1×, alinhado aos 20 ticks/s da US-002).
- RN6: 🔶 Calendário inicial: ano 1, mês 1, dia 1, hora 0. Meses com 30 dias, 24 horas por dia (modelo simplificado).
- RN7: 🔶 Controlo mínimo no anfitrião web: **Espaço** pausa/retoma (retoma para a última velocidade não pausada, default 1×); teclas **1**, **2**, **4** seleccionam a velocidade. Um indicador em PT-BR mostra data/hora e velocidade.
- RN8: O relógio vive na engine; a UI só envia pedidos de mudança de velocidade.

## 4. Critérios de aceitação (Gherkin)

### CA1: Calendário avança a 1×
```gherkin
Dado o jogo em velocidade 1× na data 1/1/1 00:00
Quando passam 20 ticks de simulação
Então o calendário mostra 1/1/1 01:00
```

### CA2: Pausa congela o tempo de jogo
```gherkin
Dado o jogo em 1×
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
Dado o jogo em 1×
Quando selecciono a velocidade 4× (tecla 4)
Então a velocidade activa é 4×
Quando o código tenta aplicar uma velocidade que não seja 0, 1, 2 ou 4
Então a velocidade anterior mantém-se
E a engine não crasha
```

### CA5: Indicador visível
```gherkin
Dado que o jogo está aberto
Quando olho para o anfitrião web
Então vejo a data/hora do jogo em PT-BR
E vejo se está pausado, 1×, 2× ou 4×
Quando mudo a velocidade
Então o indicador actualiza sem recarregar a página
```

## 5. Fora do escopo

- Painel HUD completo, inspecção de tiles, paleta de ferramentas (US-206, E2).
- Ciclo económico mensal, população, impostos.
- Gravar/carregar a data.
- Velocidades extra (8×, 16×).

## 6. Dependências

- **Bloqueia:** US-206 (o HUD reutiliza este relógio)
- **Bloqueada por:** US-002
- **Relacionada:** US-001 (indicador no anfitrião web), US-104 (TPS vs calendário)

## 7. Requisitos não-funcionais

- **Performance:** mudança de velocidade é O(1); não reinicia o mundo.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** atalhos documentados no indicador; Espaço não deve activar um botão fora do jogo se o foco estiver no canvas. O indicador é texto, não só ícone.
- **Observabilidade:** velocidade e `GameDate` consultáveis pela engine (debug futuro).
- **Internacionalização:** indicador em PT-BR (ex.: `Pausado`, `1×`, `Ano 1 · 1 jan · 00h` — formato exacto no refinement).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN5/RN6 (duração da hora e calendário 30 dias) confirmados
- [ ] Atalhos (RN7) confirmados vs conflito com o browser
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless de avanço, pausa, 2×/4× e rejeição de velocidade inválida a passar
- [ ] Indicador + atalhos validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 20 ticks = 1 hora de jogo (RN5) liga a US-002 ao calendário; se o refinement quiser dias mais lentos, muda-se um único número.
- 🔶 Meses de 30 dias evitam calendário gregoriano no MVP.
- 🔶 US-206 **não** volta a implementar o relógio; só promove o controlo para o HUD. Os atalhos desta US devem continuar a funcionar.
- ❓ Foco: os atalhos só valem com o canvas focado, ou são globais na página?
