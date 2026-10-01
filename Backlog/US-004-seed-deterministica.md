# US-004: Reproduzir a simulação com seed

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** desenvolvedor da engine,
**quero** que todo o acaso da simulação passe por um gerador com seed,
**para que** um teste ou um replay futuro reproduza o mesmo resultado.

## 2. Contexto e justificativa

A arquitectura (secção 52) proíbe `Math.random()` espalhado pela engine. Sem um `RandomGenerator` na fundação, E1 (mapa gerado) e E3 (nascimentos, migração) já nascem irreproduzíveis.

E0 ainda não tem sistemas de cidade. O valor agora é o **contrato**: a engine aceita uma seed, o gerador é injectado no contexto, e dois runs com a mesma seed e os mesmos ticks coincidem. Replay de comandos é pós-MVP; a seed é o pré-requisito barato.

Métrica de sucesso: um teste Vitest corre o loop N ticks com seed `123456` duas vezes e obtém a mesma sequência de números (e o mesmo estado do contador/calendário).

## 3. Regras de negócio

- RN1: A engine expõe um gerador de números pseudo-aleatórios determinístico controlado por **seed** inteira.
- RN2: Nenhum código em `packages/game-*` usa `Math.random()` (nem `crypto.getRandomValues` para lógica de jogo).
- RN3: A mesma seed + a mesma sequência de chamadas produz a mesma sequência de valores.
- RN4: Seeds diferentes produzem sequências diferentes (não se exige qualidade criptográfica).
- RN5: 🔶 Seed por omissão de uma sessão nova: **123456** em testes; 🔶 no browser uma seed fixa de desenvolvimento ou derivada de um valor de sessão, documentada — **não** `Date.now()` escondido dentro dos sistemas.
- RN6: O gerador vive no contexto da engine (injectado); sistemas futuros recebem o contexto, não instanciam o seu próprio RNG.

## 4. Critérios de aceitação (Gherkin)

### CA1: Mesma seed, mesmo resultado
```gherkin
Dado a seed 123456
Quando corro 100 ticks headless e peço 50 números ao gerador
E volto a correr o mesmo cenário do zero com a mesma seed
Então as duas sequências de 50 números são idênticas
E o calendário final (se o relógio estiver ligado) é idêntico
```

### CA2: Seed diferente, sequência diferente
```gherkin
Dado duas engines com seeds 123456 e 123457
Quando peço os primeiros 20 números a cada uma
Então as sequências não são iguais
```

### CA3: Proibição de Math.random no core
```gherkin
Dado o código-fonte dos packages de jogo
Quando a suite de verificação corre
Então não há usos de Math.random nesses packages
E um teste que exercita o loop não depende de acaso global do runtime
```

### CA4: Sessão expõe a seed
```gherkin
Dado que o jogo arrancou
Quando consulto o contexto da engine (teste ou indicador de debug mínimo)
Então a seed em uso é um inteiro conhecido
E posso arrancar outra instância headless com essa seed
```

### CA5: Sem gerador, a engine falha cedo
```gherkin
Dado um contexto de engine sem gerador configurado
Quando tento avançar um tick que precisaria de acaso
Então a engine rejeita o arranque ou o tick com erro explícito
E não cai para Math.random em silêncio
```

## 5. Fora do escopo

- Replay de comandos, gravação de input, comparação de versões da engine (pós-MVP).
- Geração procedural rica do mapa (US-102 usa a seed se gerar terreno; o algoritmo é dessa US).
- Criptografia, fairness online, anti-cheat.
- UI para o jogador escolher a seed (pode ser só debug / teste).

## 6. Dependências

- **Bloqueia:** US-102 (se o mapa inicial for gerado com acaso)
- **Bloqueada por:** US-002
- **Relacionada:** US-003 (mesmo contexto de engine), US-104 (a seed pode aparecer no overlay mais tarde)

## 7. Requisitos não-funcionais

- **Performance:** gerar um número é O(1); sem alocações excessivas por tick no gerador.
- **Segurança/Privacidade:** o RNG **não** é criptográfico e **não** deve ser usado para tokens/auth (auth não existe neste lote).
- **Acessibilidade:** não há UI obrigatória; se a seed for mostrada, é texto.
- **Observabilidade:** seed consultável; falha CA5 com mensagem de erro clara em log de teste.
- **Internacionalização:** não aplicável salvo label de debug futuro em PT-BR (`Semente`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Algoritmo do PRNG (mulberry32, xorshift, etc.) escolhido — detalhe de implementação, mas a seed é o contrato
- [ ] RN5: seed default no browser confirmada
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes CA1–CA3 e CA5 a passar de forma determinística no CI local
- [ ] Check (lint ou teste de grep) contra `Math.random` nos packages de jogo
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Seed `123456` é a da própria arquitectura (secção 52); usar nos testes como número canónico.
- 🔶 CA3 pode ser um teste que lê ficheiros fonte ou uma convenção + revisão; o importante é falhar o CI se alguém colar `Math.random` no core.
- ❓ Mostrar a seed no overlay F1 (US-104) já em E1, ou só em ferramentas internas?
- ❓ Intervalo do gerador: float 0..1 vs inteiro 32-bit — a API pública deve ser uma e estável. 🔶 `proximo()` em [0, 1) + `proximoInteiro(min, max)`.
