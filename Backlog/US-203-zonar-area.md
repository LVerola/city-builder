# US-203: Zonar uma área residencial, comercial ou industrial

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** marcar um retângulo do mapa como zona residencial, comercial ou industrial,
**para que** defina o uso do solo onde a cidade vai crescer.

## 2. Contexto e justificativa

Zonas são o terceiro verbo clássico do género (depois de terreno e estrada). Sem elas, o jogador só pinta tiles e não expressa intenção de bairro.

O comando `ZONE_AREA` recebe tipo + retângulo. A simulação que preenche a zona com casas é E3; aqui a zona é tinta no mapa. Colocar edifício **não** exige zona compatível neste sandbox (US-204).

## 3. Regras de negócio

- RN1: Ferramenta **Zona** com três subtipos: **residencial**, **comercial**, **industrial** (um botão + escolha de tipo, não três ferramentas soltas).
- RN2: O gesto define um retângulo inclusivo de tiles entre o canto inicial e o canto final.
- RN3: Cada tile válida do retângulo recebe `zone`; um tipo novo **substitui** o anterior.
- RN4: Zonar **não** cria edifícios.
- RN5: Não se zona `water` nem `mountain`; essas tiles são **saltadas** e o resto do retângulo aplica-se (o comando não falha por inteiro).
- RN6: Tiles com estrada **podem** ser zonadas (zona + estrada coexistem).
- RN7: Rectângulo de uma única tile é válido.
- RN8: A ação é um comando da engine.
- RN9: Visual R/C/I usa as cores clássicas (verde / azul / amarelo) **e** padrão ou ícone + texto em PT-BR. Não só a cor.

## 4. Critérios de aceitação (Gherkin)

### CA1: Zonar um retângulo residencial
```gherkin
Dado que a ferramenta Zona está ativa no tipo residencial
E as tiles de (1, 1) a (3, 2) são grass sem zona
Quando confirmo o retângulo de (1, 1) até (3, 2)
Então as seis tiles ficam com zona residencial
E o canvas mostra overlay residencial (cor + padrão)
E nenhum edifício é criado
```

### CA2: Substituir zona existente
```gherkin
Dado que as tiles (0, 0) e (1, 0) já são residenciais
E a ferramenta Zona está no tipo industrial
Quando confirmo o retângulo que cobre (0, 0) e (1, 0)
Então essas tiles passam a industriais
E o overlay visual atualiza
```

### CA3: Água e montanha são saltadas
```gherkin
Dado um retângulo que contém uma tile water e tiles grass
Quando confirmo a zona comercial
Então as tiles grass do retângulo ficam comerciais
E a tile water permanece sem zona comercial
E o comando não é rejeitado por inteiro
```

### CA4: Ferramenta errada não zona
```gherkin
Dado que a ferramenta Select está ativa
Quando arrasto um retângulo sobre o mapa
Então nenhuma tile muda de zona
```

### CA5: Comando headless
```gherkin
Dado um mundo 64×64 sem UI
Quando a engine executa ZONE_AREA industrial na área (10, 10) a (12, 12)
Então as tiles interiores dessa área têm zona industrial
E um evento de zona alterada é emitido
```

## 5. Fora do escopo

- Zona de escritórios (`office`).
- Crescimento automático de prédios na zona (E3).
- Densidade (baixa/média/alta).
- Exigir estrada adjacente para zonar.
- Exigir zona compatível para construir (US-204: não exige neste lote).
- Demanda R/C/I no HUD (E3).

## 6. Dependências

- **Bloqueia:** nenhuma obrigatória para US-204 (zona não é pré-requisito de colocação)
- **Bloqueada por:** US-201
- **Relacionada:** US-202, US-204, US-205, US-206

## 7. Requisitos não-funcionais

- **Performance:** zonar até 64×64 tiles num comando sem nós React por tile.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** cor clássica **mais** padrão/ícone + texto (`Residencial`, `Comercial`, `Industrial`).
- **Observabilidade:** comando testável; overlay visível com debug desligado.
- **Internacionalização:** UI em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Água/montanha: saltar tiles, não falhar o retângulo
- [x] Zona não é pré-requisito da US-204 neste sandbox
- [x] Cores clássicas + padrão/ícone + texto
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless (retângulo, substituição, skip de água, tile única) a passar
- [ ] Overlay de zona no Canvas
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Rectângulo com água: aplicar o válido e **saltar** o inválido. Aceito.
- Edifício **não** exige zona compatível neste sandbox (US-204).
- Cores clássicas R/C/I **com** padrão/ícone + texto: sim.
