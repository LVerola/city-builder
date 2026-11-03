# US-205: Demolir construção, estrada ou zona

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** demolir o que está numa tile, com confirmação,
**para que** corrija erros de construção sem recomeçar o mapa nem apagar à toa.

## 2. Contexto e justificativa

Sandbox sem borracha não se pratica. A ferramenta **Demolir** é o complemento de estrada, zona e edifício.

A prioridade tem de ser explícita: um clique não pode ser ambíguo quando a tile tem zona e estrada. Terreno **não** se apaga aqui. O jogador pede confirmação antes de aplicar, para um clique errado não derrubar um 2×2.

## 3. Regras de negócio

- RN1: Ferramenta **Demolir** aplica um comando por clique e, ao arrastar, **uma tile por passo** (como pintar), com a mesma prioridade.
- RN2: Prioridade na tile: **edifício** > **estrada** > **zona**. Um passo remove só o item de maior prioridade presente.
- RN3: Demolir edifício remove a entidade e liberta **todas** as tiles que ela ocupava.
- RN4: Demolir estrada limpa `roadId` apenas da tile alvo (não o segmento inteiro).
- RN5: Demolir zona limpa `zone` apenas da tile alvo, e só se não restar edifício nem estrada (senão RN2).
- RN6: Terreno **nunca** muda por demolir.
- RN7: Clique em tile vazia (só terreno) é no-op, **sem** diálogo de confirmação.
- RN8: Não há custo de demolição neste lote.
- RN9: Qualquer demolição que altere o mundo pede **confirmação** em PT-BR (`Demolir?` com **Sim** e **Cancelar**). Cancelar não muta o mundo.
- RN10: No arrasto: o diálogo aparece na **primeira** tile ocupada; se o jogador confirmar, as tiles seguintes do mesmo gesto aplicam-se sem novo diálogo até soltar. Se cancelar, o gesto não demole nada.

## 4. Critérios de aceitação (Gherkin)

### CA1: Demolir edifício após confirmação
```gherkin
Dado um edifício 2×2 ancorado em (10, 10)
E a ferramenta Demolir está ativa
Quando clico na tile (11, 11)
Então vejo o diálogo "Demolir?" com Sim e Cancelar
E o edifício ainda existe
Quando escolho Sim
Então o edifício deixa de existir
E as quatro tiles ficam sem edifício
E o terreno permanece o mesmo
```

### CA2: Cancelar não demole
```gherkin
Dado uma estrada na tile (5, 5)
E a ferramenta Demolir está ativa
Quando clico em (5, 5)
E escolho Cancelar
Então a estrada permanece
E não há segundo diálogo
```

### CA3: Demolir zona só depois de estrada/edifício
```gherkin
Dado uma tile com zona residencial e estrada, sem edifício
E a ferramenta Demolir está ativa
Quando clico nessa tile e confirmo
Então a estrada desaparece
E a zona residencial permanece
Quando clico de novo, confirmo
Então a zona é removida
```

### CA4: Tile vazia é no-op sem diálogo
```gherkin
Dado uma tile grass sem zona, estrada nem edifício
E a ferramenta Demolir está ativa
Quando clico nessa tile
Então o terreno não muda
E o diálogo de confirmação não aparece
```

### CA5: Comando headless
```gherkin
Dado um mundo com um edifício em (0, 0)
Quando a engine executa o comando de demolir na tile (0, 0)
Então o edifício é removido
E um evento de edifício destruído é emitido
```

### CA6: Arrasto com uma confirmação
```gherkin
Dado estradas em (1, 1) e (1, 2) sem edifício
E a ferramenta Demolir está ativa
Quando pressiono em (1, 1), confirmo Demolir, e arrasto até (1, 2) antes de soltar
Então ambas as tiles ficam sem estrada
E não aparece um segundo diálogo no meio do gesto
```

## 5. Fora do escopo

- Demolir o mapa inteiro / “limpar cidade”.
- Desfazer.
- Ruína / animações de destruição.
- Pintar terreno (US-201).
- Custo de demolição.

## 6. Dependências

- **Bloqueia:** nenhuma obrigatória
- **Bloqueada por:** US-202, US-204 (zona US-203 para CA3)
- **Relacionada:** US-201, US-206 (painel atualiza se a entidade inspecionada foi demolida)

## 7. Requisitos não-funcionais

- **Performance:** demolir edifício atualiza só as tiles afetadas no renderer.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** ferramenta `Demolir`; diálogo com Sim/Cancelar focáveis por teclado; Esc = Cancelar.
- **Observabilidade:** eventos de destruição testáveis.
- **Internacionalização:** UI em PT-BR (`Demolir?`, `Sim`, `Cancelar`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Prioridade edifício > estrada > zona
- [x] Arrasto como pintura, uma tile por passo
- [x] Confirmação Sim/Cancelar **incluída**
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless da prioridade, libertação 2×2 e comando a passar
- [ ] Confirmação e cancelamento validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Arrasto como pintura: **aceito**.
- Demolir **não** altera terreno: aceito.
- Confirmação **adicionada**: diálogo `Demolir?` / Sim / Cancelar. No arrasto, uma confirmação no início do gesto.
