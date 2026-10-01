# US-205: Demolir construção, estrada ou zona

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** demolir o que está numa tile,
**para que** corrija erros de construção sem recomeçar o mapa.

## 2. Contexto e justificativa

Sandbox sem borracha não se pratica. A ferramenta **Bulldoze/Demolir** da arquitectura é o complemento de estrada, zona e edifício.

A regra tem de ser explícita na prioridade: um clique não pode ser ambíguo quando a tile tem zona e estrada. Terreno **não** se apaga aqui — isso é a ferramenta Pintar.

Métrica de sucesso: o jogador demole um edifício 2×2 e as quatro tiles ficam livres; demole uma estrada tile a tile; limpa zona; clicar relva vazia não faz nada destrutivo.

## 3. Regras de negócio

- RN1: Ferramenta **Demolir** aplica um comando por clique (e 🔶 por tile ao arrastar).
- RN2: Prioridade na tile: **edifício** > **estrada** > **zona**. Um clique remove só o item de maior prioridade presente.
- RN3: Demolir edifício remove a entidade e liberta **todas** as tiles que ela ocupava, mesmo que o clique tenha sido numa tile interior.
- RN4: Demolir estrada limpa `roadId` apenas da tile clicada (não apaga o segmento inteiro).
- RN5: Demolir zona limpa `zone` apenas da tile clicada, e só se não restar edifício nem estrada nessa tile (senão RN2 aplica-se primeiro).
- RN6: Terreno **nunca** muda por demolir.
- RN7: Clique em tile vazia (só terreno) é no-op, sem erro bloqueante.
- RN8: 🔶 Não há custo de demolição neste lote.

## 4. Critérios de aceitação (Gherkin)

### CA1: Demolir edifício liberta todas as tiles
```gherkin
Dado um edifício 2×2 ancorado em (10, 10)
E a ferramenta Demolir está activa
Quando clico na tile (11, 11)
Então o edifício deixa de existir
E as tiles (10, 10), (11, 10), (10, 11) e (11, 11) ficam sem edifício
E o terreno dessas tiles permanece o mesmo
```

### CA2: Demolir estrada numa tile
```gherkin
Dado uma estrada nas tiles (5, 5) e (6, 5) sem edifício
E a ferramenta Demolir está activa
Quando clico em (5, 5)
Então (5, 5) deixa de ter estrada
E (6, 5) mantém a estrada
```

### CA3: Demolir zona só depois de estrada/edifício
```gherkin
Dado uma tile com zona residencial e estrada, sem edifício
E a ferramenta Demolir está activa
Quando clico nessa tile
Então a estrada desaparece
E a zona residencial permanece
Quando clico de novo na mesma tile
Então a zona é removida
```

### CA4: Tile vazia é no-op
```gherkin
Dado uma tile grass sem zona, estrada nem edifício
E a ferramenta Demolir está activa
Quando clico nessa tile
Então o terreno não muda
E nenhuma entidade é criada ou removida
```

### CA5: Comando headless
```gherkin
Dado um mundo com um edifício em (0, 0)
Quando a engine executa o comando de demolir na tile (0, 0)
Então o edifício é removido
E um evento de edifício destruído é emitido
```

## 5. Fora do escopo

- Demolir o mapa inteiro / “limpar cidade”.
- Desfazer.
- Ruína / animações de destruição.
- Pintar terreno (US-201).
- Custo de demolição.

## 6. Dependências

- **Bloqueia:** nenhuma obrigatória
- **Bloqueada por:** US-202, US-204 (precisa de algo para demolir; zona US-203 para CA3)
- **Relacionada:** US-201 (pintar depois de libertar a tile), US-206 (painel fecha se a entidade inspecionada foi demolida)

## 7. Requisitos não-funcionais

- **Performance:** demolir edifício actualiza só as tiles afectadas no renderer.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** ferramenta nomeada `Demolir`; cursor ou rótulo distinto das outras.
- **Observabilidade:** eventos de destruição testáveis.
- **Internacionalização:** UI em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN2 (prioridade) confirmada
- [ ] Arrastar para demolir várias tiles: neste sprint ou não
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless da prioridade e da libertação 2×2 a passar
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Arrastar com demolir activo comporta-se como a pintura: uma tile por passo, mesma prioridade.
- 🔶 Demolir **não** é a ferramenta Pintar: relva vazia não vira buraco.
- ❓ Confirmação extra para demolir (não nesta US — um clique é suficiente no sandbox)?
