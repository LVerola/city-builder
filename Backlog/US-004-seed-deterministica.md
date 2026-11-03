# US-004: Reproduzir a simulação com seed

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** que todo o acaso da simulação passe por um gerador com seed,
**para que** um teste ou um replay futuro reproduza o mesmo resultado.

## 2. Contexto e justificativa

A arquitetura (seção 52) proíbe `Math.random()` espalhado pela engine. Sem um gerador na fundação, E1 (mapa gerado) e E3 (nascimentos, migração) já nascem irreproduzíveis.

E0 ainda não tem sistemas de cidade. O valor agora é o **contrato**: a engine aceita uma seed, o gerador é injetado no contexto, e dois runs com a mesma seed e os mesmos ticks coincidem. Replay de comandos é pós-MVP; a seed é o pré-requisito barato.

Mostrar a seed no overlay F1 **não** é desta US — está na US-104.

Métrica de sucesso: um teste Vitest corre o loop N ticks com seed `123456` duas vezes e obtém a mesma sequência de números (e o mesmo estado do contador/calendário).

## 3. Regras de negócio

- RN1: A engine expõe um gerador de números pseudo-aleatórios determinístico controlado por **seed** inteira.
- RN2: Nenhum código em `packages/game-*` usa `Math.random()` (nem `crypto.getRandomValues` para lógica de jogo).
- RN3: A mesma seed + a mesma sequência de chamadas produz a mesma sequência de valores.
- RN4: Seeds diferentes produzem sequências diferentes (não se exige qualidade criptográfica).
- RN5: Seed canónica **123456** (arquitetura, seção 52): obrigatória nos testes; também é a seed por padrão de uma sessão nova no browser neste lote. **Não** se usa `Date.now()` nem acaso global dentro dos sistemas.
- RN6: O gerador vive no contexto da engine (injetado); sistemas futuros recebem o contexto, não instanciam o seu próprio RNG.
- RN7: API pública estável em PT-BR: `proximo()` devolve um número em **[0, 1)**; `proximoInteiro(min, max)` devolve um inteiro inclusivo no intervalo. Não há outra API de acaso no core.
- RN8: A seed é consultável no contexto da engine (testes / código). O overlay F1 que a mostra ao jogador é **US-104**.

## 4. Critérios de aceitação (Gherkin)

### CA1: Mesma seed, mesmo resultado
```gherkin
Dado a seed 123456
Quando corro 100 ticks headless e peço 50 números ao gerador via proximo
E volto a correr o mesmo cenário do zero com a mesma seed
Então as duas sequências de 50 números são idênticas
E o calendário final (se o relógio estiver ligado) é idêntico
```

### CA2: Seed diferente, sequência diferente
```gherkin
Dado duas engines com seeds 123456 e 123457
Quando peço os primeiros 20 números a cada uma com proximo
Então as sequências não são iguais
```

### CA3: Proibição de Math.random no core
```gherkin
Dado o código-fonte dos packages de jogo
Quando a suite de testes (grep ou lint) corre no CI
Então a suite falha se existir Math.random ou crypto.getRandomValues nesses packages
E um teste que exercita o loop não depende de acaso global do runtime
```

### CA4: Sessão expõe a seed no contexto
```gherkin
Dado que o jogo arrancou com a seed por padrão
Quando consulto o contexto da engine (teste headless ou API do core)
Então a seed em uso é 123456
E posso arrancar outra instância headless com essa seed e obter a mesma sequência
```

### CA5: Sem gerador, a engine falha cedo
```gherkin
Dado um contexto de engine sem gerador configurado
Quando tento avançar um tick que precisaria de acaso
Então a engine rejeita o arranque ou o tick com erro explícito
E não cai para Math.random em silêncio
```

### CA6: Intervalo da API
```gherkin
Dado um gerador com seed 123456
Quando chamo proximo 100 vezes
Então cada valor está em [0, 1) (0 inclusive, 1 exclusive)
Quando chamo proximoInteiro(3, 7) 50 vezes
Então cada valor é um inteiro entre 3 e 7 inclusive
```

## 5. Fora do escopo

- Replay de comandos, gravação de input, comparação de versões da engine (pós-MVP).
- Geração procedural rica do mapa (US-102 usa a seed se gerar terreno; o algoritmo é dessa US).
- Criptografia, fairness online, anti-cheat.
- UI para o jogador escolher a seed.
- Mostrar a seed no overlay F1 (US-104).

## 6. Dependências

- **Bloqueia:** US-102 (se o mapa inicial for gerado com acaso)
- **Bloqueada por:** US-002
- **Relacionada:** US-003 (mesmo contexto de engine), US-104 (overlay F1 mostra a seed)

## 7. Requisitos não-funcionais

- **Performance:** gerar um número é O(1); sem alocações excessivas por tick no gerador.
- **Segurança/Privacidade:** o gerador **não** é criptográfico e **não** deve ser usado para tokens/auth (auth não existe neste lote).
- **Acessibilidade:** não há UI obrigatória nesta US.
- **Observabilidade:** seed consultável no contexto; falha CA5 com erro explícito. Overlay visual = US-104.
- **Internacionalização:** nomes da API em PT-BR (`proximo`, `proximoInteiro`). Label `Semente` no overlay fica para a US-104.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Seed canónica **123456** (testes e omissão no browser)
- [x] CA3 = teste/CI que falha com `Math.random` no core
- [x] Overlay F1 da seed = US-104
- [x] API: `proximo()` em [0, 1) e `proximoInteiro(min, max)`
- [ ] Algoritmo interno do PRNG (mulberry32, xorshift, …) — detalhe de implementação, desde que determinístico
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes CA1, CA2, CA3, CA5 e CA6 a passar de forma determinística
- [ ] Check automatizado contra `Math.random` / `crypto.getRandomValues` nos packages de jogo
- [ ] Sem overlay F1 nesta US
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Seed **123456** fechada: testes e sessão nova no browser neste lote.
- CA3 fechado: a suite **falha no CI** se alguém colar `Math.random` (ou `crypto.getRandomValues`) em `packages/game-*`.
- Mostrar a seed no F1 fica na **US-104** (já relacionada; o overlay é o lugar certo).
- API fechada: `proximo()` ∈ [0, 1) e `proximoInteiro(min, max)` inclusivo.
- Algoritmo do PRNG não está congelado; só o contrato da seed e da API.
