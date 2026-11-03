# US-206: Inspecionar tile ou edifício no HUD

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** ver um painel fixo com os dados da tile ou do edifício selecionado,
**para que** confirme o que está no mapa sem adivinhar pelo desenho do canvas.

## 2. Contexto e justificativa

O React entra no papel correto da arquitetura: HUD, não mundo. O fluxo é Canvas → engine → evento de UI → Zustand → painel (seção 33).

Em E2 o painel mostra o que já existe (terreno, zona, estrada, definição do edifício, relógio). Empregados e produção ficam para E3.

## 3. Regras de negócio

- RN1: **Select e Inspecionar são a mesma ferramenta** na paleta. A seleção de uma tile atualiza o painel.
- RN2: O painel é HTML/React, **lateral fixo à direita**. O conteúdo é leitura do mundo via eventos/snapshot, não uma cópia divergente.
- RN3: Tile sem edifício mostra: coordenadas, tipo de terreno (PT-BR), zona (ou “Sem zona”), presença de estrada (sim/não).
- RN4: Tile com edifício mostra: nome da definição, categoria, tamanho em tiles, custo de construção (informativo), coordenadas da âncora.
- RN5: Existe controle para **fechar** o detalhe; o mapa continua usável. Fechar não impede o resto do HUD (ferramenta ativa, relógio).
- RN6: Se a entidade inspecionada for demolida ou a seleção limpa, o detalhe passa a “Nada selecionado”.
- RN7: O HUD mostra a **ferramenta ativa** e o **relógio do jogo** (ano/mês/dia/hora + velocidade pausa/1×/2×/4×).
- RN8: Alterar a velocidade no HUD altera o relógio da US-003; não altera lógica de sistemas. Atalhos Espaço/1/2/4 continuam **com o canvas focado**.
- RN9: Clicar no **indicador de relógio** (data/hora ou estado pausado) faz **pausa/retoma**, além dos controles 1×/2×/4×.

## 4. Critérios de aceitação (Gherkin)

### CA1: Inspecionar tile vazia
```gherkin
Dado que a ferramenta Select está ativa
E a tile (4, 7) é forest, sem zona, sem estrada, sem edifício
Quando clico em (4, 7)
Então o painel fixo à direita mostra as coordenadas 4, 7
E mostra terreno "Floresta"
E mostra "Sem zona"
E mostra que não há estrada
```

### CA2: Inspecionar edifício
```gherkin
Dado um edifício da definição "small_fatory" ancorado em (12, 12)
Quando seleciono uma tile ocupada por esse edifício
Então o painel mostra o nome em PT-BR da definição
E mostra a categoria
E mostra o tamanho em tiles
E mostra o custo de construção da definição
E não mostra empregados nem produção
```

### CA3: Fechar o detalhe
```gherkin
Dado que o painel está aberto com uma tile selecionada
Quando ativo o controle de fechar
Então o detalhe vai para "Nada selecionado" ou oculta o corpo
E o mapa continua navegável
E o relógio e a ferramenta ativa permanecem visíveis
```

### CA4: Demolição atualiza o HUD
```gherkin
Dado que estou a inspecionar um edifício
Quando demolo esse edifício (e confirmo na US-205)
Então o painel deixa de mostrar o edifício demolido
E passa a mostrar o estado atual da tile (ou "Nada selecionado")
```

### CA5: Relógio, velocidade e pausa pelo clique
```gherkin
Dado que o jogo está visível em /jogo
Quando olho para o HUD
Então vejo a ferramenta ativa por nome em PT-BR
E vejo a data/hora do jogo
Quando escolho a velocidade 2×
Então o relógio passa a avançar a 2×
Quando clico no indicador do relógio
Então o jogo fica pausado
Quando clico de novo
Então retoma a última velocidade não pausada
```

### CA6: Estado vazio sem seleção
```gherkin
Dado que nenhuma tile está selecionada
Quando o HUD de inspeção é mostrado
Então vejo o estado vazio "Nada selecionado"
E não vejo dados de um edifício anterior
```

### CA7: Painel fixo, não flutuante
```gherkin
Dado que seleciono tiles em lugares diferentes do mapa
Quando o painel atualiza
Então a posição do painel na página não segue o clique
E permanece ancorado ao lado direito da UI
```

## 5. Fora do escopo

- Gráficos de população, GDP, procura R/C/I (E3).
- Políticas, notificações, tutorial.
- Painel de definições de gráficos / qualidade.
- Explainability.
- Edição de propriedades pelo painel (HUD só leitura).
- Segunda ferramenta “Inspecionar” na paleta.

## 6. Dependências

- **Bloqueia:** nenhuma neste lote
- **Bloqueada por:** US-103, US-003. Completa com US-202/US-203/US-204/US-205
- **Relacionada:** US-104 (debug não substitui este HUD)

## 7. Requisitos não-funcionais

- **Performance:** abrir/atualizar o painel não dispara re-render do canvas; Zustand só para UI.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** painel HTML com cabeçalho, fechar focável, contrastes WCAG 2.2 AA. Relógio clicável tem nome acessível (`Pausar` / `Retomar`).
- **Observabilidade:** não obrigatório além do debug.
- **Internacionalização:** todos os textos do HUD em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Select = Inspecionar (uma ferramenta)
- [x] Painel **lateral fixo à direita**
- [x] Relógio clicável pausa/retoma
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes da projecção mundo → view-model do painel (sem canvas) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] O store de UI não contém o mundo completo da simulação
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Select e Inspecionar = **a mesma ferramenta**. Aceito.
- Relógio do HUD reutiliza US-003; atalhos só com canvas focado. Aceito.
- Painel **fixo** à direita (não flutuante junto ao clique).
- Relógio **clicável** para pausar/retomar: sim.
