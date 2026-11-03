# US-201: Pintar o terreno com ferramenta

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** pintar o tipo de terreno de um tile com uma ferramenta,
**para que** molde o mapa (água, floresta, relva) antes de construir a cidade.

## 2. Contexto e justificativa

Esta é a primeira ação do jogador que **muta** o mundo. Serve de fatia vertical para o padrão da arquitetura: ferramenta → comando → validação → mutação → evento (seção 29), com o React só a saber qual ferramenta está ativa.

Se o padrão nascer aqui, estradas, zonas e edifícios reutilizam o mesmo caminho em vez de cada ferramenta falar com o Canvas à sua maneira.

Métrica de sucesso: o jogador escolhe “Pintar terreno”, escolhe um tipo, clica ou arrasta, e as tiles mudam de visual; a mesma mutação é reproduzível num teste headless via comando, sem UI.

## 3. Regras de negócio

- RN1: Existe uma paleta de ferramentas na UI; a ferramenta ativa é estado de UI (não estado de simulação).
- RN2: A ferramenta **Pintar terreno** aplica o tipo de terreno atualmente escolhido às tiles alvo.
- RN3: Tipos pintáveis: `grass`, `water`, `forest`, `mountain`, `sand`.
- RN4: Clique com botão esquerdo pinta **uma** tile; arrastar com o botão esquerdo premido pinta todas as tiles percorridas.
- RN5: Pintar é um **comando** da engine. A ferramenta não escreve no mundo à revelia do `GameEngine`.
- RN6: Pintar com a ferramenta Select (ou outra) ativa **não** altera terreno.
- RN7: Pintar a mesma tile com o tipo que ela já tem é permitido e deixa o tipo inalterado (não é erro).
- RN8: Pintar **substitui** o terreno mesmo que a tile tenha zona; a **zona mantém-se**. **Não** é permitido se a tile tiver estrada ou edifício (demolir primeiro).
- RN9: Ao ativar a ferramenta, o tipo de pincel por padrão é **`grass`**.
- RN10: Recusa visível: **mensagem curta no HUD** em PT-BR (sem sistema de toasts/notificações). Cursor de recusa é opcional, a mensagem é obrigatória.

## 4. Critérios de aceitação (Gherkin)

### CA1: Pintar uma tile
```gherkin
Dado que a ferramenta Pintar terreno está ativa
E o tipo escolhido é water
E a tile (8, 8) é grass e está vazia
Quando clico com o botão esquerdo em (8, 8)
Então a tile (8, 8) passa a ser water
E o canvas mostra o visual de água nessa tile
```

### CA2: Arrastar pinta um caminho de tiles
```gherkin
Dado que a ferramenta Pintar terreno está ativa
E o tipo escolhido é forest
Quando pressiono o botão esquerdo em (2, 2) e arrasto até (2, 5) antes de soltar
Então as tiles (2, 2), (2, 3), (2, 4) e (2, 5) passam a forest
E tiles fora desse caminho permanecem inalteradas
```

### CA3: Ferramenta inativa não pinta
```gherkin
Dado que a ferramenta Select está ativa
E o tipo de pincel está definido como mountain
Quando clico na tile (3, 3)
Então a tile (3, 3) é selecionada
E o tipo de terreno de (3, 3) não muda
```

### CA4: Recusar pintar sobre edifício ou estrada
```gherkin
Dado que a ferramenta Pintar terreno está ativa
E a tile (4, 4) tem uma estrada
Quando clico em (4, 4)
Então o terreno de (4, 4) não muda
E a estrada permanece
E o HUD mostra uma mensagem curta em PT-BR a recusar a ação
```

### CA5: Comando reproduzível sem UI
```gherkin
Dado um mundo headless com a tile (0, 0) grass e vazia
Quando a engine executa o comando de pintar (0, 0) como sand
Então a tile (0, 0) passa a sand
E um evento de mundo alterado é emitido
```

### CA6: Pincel default e zona mantida
```gherkin
Dado que acabo de ativar Pintar terreno
Então o tipo de pincel ativo é Relva (grass)
Dado uma tile grass com zona residencial e sem estrada nem edifício
Quando pinto essa tile como sand
Então o terreno passa a sand
E a zona residencial permanece
```

## 5. Fora do escopo

- Undo/redo visível (o comando existe para o permitir depois).
- Pincel com raio maior que 1 tile.
- Geração procedural contínua (só pintura manual).
- Custo em dinheiro para alterar terreno.
- Sistema de notificações/toasts.

## 6. Dependências

- **Bloqueia:** US-202, US-203 (padrão ferramenta + comando + paleta)
- **Bloqueada por:** US-103
- **Relacionada:** US-205 (demolir para libertar tile antes de pintar, RN8)

## 7. Requisitos não-funcionais

- **Performance:** arrastar sobre dezenas de tiles não deve criar um componente React por tile pintada.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** ferramenta ativa, tipo de pincel e recusa em texto na UI (não só ícone).
- **Observabilidade:** comandos recusados observáveis em teste (motivo de rejeição).
- **Internacionalização:** paleta em PT-BR (`Selecionar`, `Pintar terreno`, `Relva`, `Água`, `Floresta`, `Montanha`, `Areia`).

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] RN8: substitui terreno, **mantém zona**; recusa sobre estrada/edifício
- [x] Recusa = mensagem curta no HUD
- [x] Pincel default = `grass`
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless do comando (feliz, recusa, no-op de mesmo tipo, zona mantida) a passar
- [ ] Paleta de ferramentas visível; ferramenta ativa refletida na UI
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Recusa: **mensagem curta no HUD** (sem toasts). Proposta aceito.
- Pintar **mantém a zona**. Aceito.
- Pincel default ao ativar: **`grass`**. Sim.
