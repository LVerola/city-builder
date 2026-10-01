# US-206: Inspecionar tile ou edifício no HUD

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** ver um painel com os dados da tile ou do edifício selecionado,
**para que** confirme o que está no mapa sem adivinhar pelo desenho do canvas.

## 2. Contexto e justificativa

O React entra aqui no papel correcto da arquitectura: HUD, não mundo. O fluxo é Canvas → engine → evento de UI → Zustand → painel (secção 33), sem o painel possuir a simulação.

Em E2 o painel mostra o que já existe (terreno, zona, estrada, definição do edifício, relógio). Empregados, electricidade e produção ficam para E3; o sítio no HUD já existe.

Métrica de sucesso: ao selecionar uma fábrica, o painel mostra nome, tamanho e custo da definição; ao demolir essa fábrica com o painel aberto, o HUD não fica preso a uma entidade morta.

## 3. Regras de negócio

- RN1: Com a ferramenta **Select** ou **Inspecionar**, a selecção de uma tile actualiza o painel de HUD.
- RN2: O painel é HTML/React; o conteúdo é leitura do mundo via eventos/snapshot, não uma cópia divergente persistente.
- RN3: Tile sem edifício mostra: coordenadas, tipo de terreno (label PT-BR), zona (ou “Sem zona”), presença de estrada (sim/não).
- RN4: Tile com edifício mostra: nome da definição, categoria, tamanho em tiles, custo de construção (informativo), coordenadas da âncora.
- RN5: Existe controlo para **fechar** o painel; fechar **não** é obrigatório para jogar (o mapa continua usável).
- RN6: Se a entidade inspecionada for demolida ou a selecção limpa, o painel passa ao estado vazio (“Nada selecionado”).
- RN7: O HUD mostra a **ferramenta activa** e o **relógio do jogo** (ano/mês/dia/hora + velocidade pausa/1×/2×/4×).
- RN8: 🔶 Alterar a velocidade no HUD altera o `GameClock`; não altera a lógica dos sistemas (ainda inexistentes).

## 4. Critérios de aceitação (Gherkin)

### CA1: Inspecionar tile vazia
```gherkin
Dado que a ferramenta Select está activa
E a tile (4, 7) é forest, sem zona, sem estrada, sem edifício
Quando clico em (4, 7)
Então o painel mostra as coordenadas 4, 7
E mostra terreno "Floresta"
E mostra "Sem zona"
E mostra que não há estrada
```

### CA2: Inspecionar edifício
```gherkin
Dado um edifício da definição "small_factory" ancorado em (12, 12)
Quando seleciono uma tile ocupada por esse edifício
Então o painel mostra o nome em PT-BR da definição
E mostra a categoria
E mostra o tamanho em tiles
E mostra o custo de construção da definição
E não mostra empregados nem produção (ainda não existem)
```

### CA3: Fechar o painel
```gherkin
Dado que o painel está aberto com uma tile selecionada
Quando activo o controlo de fechar
Então o painel vai para o estado vazio ou oculta o detalhe
E o mapa continua navegável
```

### CA4: Demolição actualiza o HUD
```gherkin
Dado que estou a inspecionar um edifício
Quando demolo esse edifício
Então o painel deixa de mostrar o edifício demolido
E passa a mostrar o estado actual da tile (ou "Nada selecionado")
```

### CA5: Relógio e ferramenta activa
```gherkin
Dado que o jogo está visível
Quando olho para o HUD
Então vejo a ferramenta activa por nome em PT-BR
E vejo a data/hora do jogo
Quando escolho a velocidade 2×
Então o relógio do jogo passa a avançar a 2×
E o mundo no canvas não é recarregado
```

### CA6: Estado vazio sem selecção
```gherkin
Dado que nenhuma tile está selecionada
Quando o HUD de inspecção é mostrado
Então vejo o estado vazio "Nada selecionado"
E não vejo dados de um edifício anterior
```

## 5. Fora do escopo

- Gráficos de população, GDP, procura R/C/I (E3).
- Políticas, notificações, tutorial.
- Painel de definições de gráficos / qualidade.
- Explainability (“porque está abandonado”).
- Edição de propriedades pelo painel (o HUD é só leitura neste lote).

## 6. Dependências

- **Bloqueia:** nenhuma neste lote
- **Bloqueada por:** US-103 (selecção), US-003 (relógio). Completa com US-202/US-203/US-204 para os CA de estrada/zona/edifício
- **Relacionada:** US-104 (debug não substitui este HUD), US-205 (CA4)

## 7. Requisitos não-funcionais

- **Performance:** abrir/actualizar o painel não dispara re-render do canvas; Zustand só para UI.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** painel em HTML com cabeçalho, botão fechar focável, contrastes WCAG 2.2 AA nos textos do HUD. O canvas continua a ser o mundo.
- **Observabilidade:** não obrigatório além do que o debug já mostra.
- **Internacionalização:** todos os textos do HUD em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Wireframe mínimo do painel (mesmo em texto) acordado
- [ ] RN1: Select e Inspecionar são a mesma ferramenta ou duas entradas na paleta
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes da projecção mundo → view-model do painel (sem canvas) a passar
- [ ] Critérios de aceitação validados no browser
- [ ] O store de UI não contém o mundo completo da simulação
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Select e Inspecionar podem ser a **mesma** ferramenta na paleta nesta US; um segundo botão “Inspecionar” só se o refinement quiser cursor diferente.
- 🔶 Velocidade no HUD (CA5) reutiliza o relógio da US-003. Os atalhos Espaço/1/2/4 continuam a valer; o HUD não reimplementa o calendário.
- ❓ O painel é lateral fixo ou flutuante junto ao clique?
- ❓ Relógio clicável para pausar (além do selector 1×/2×/4×)?
