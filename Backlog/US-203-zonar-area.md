# US-203: Zonar uma área residencial, comercial ou industrial

> **Origem:** Épico E2 — Sandbox de construção
> **Status:** Em refinamento
> **Estimativa preliminar:** 3 SP (~16h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** marcar um rectângulo do mapa como zona residencial, comercial ou industrial,
**para que** defina o uso do solo onde a cidade vai crescer.

## 2. Contexto e justificativa

Zonas são o terceiro verbo clássico do género (depois de terreno e estrada). Sem elas, o jogador só pinta tiles e não expressa intenção de bairro.

O comando `ZONE_AREA` da arquitectura recebe tipo + rectângulo. A simulação que *preenche* a zona com casas (procura, crescimento) é E3; aqui a zona é tinta no mapa, visível e consultável.

Métrica de sucesso: o jogador arrasta um rectângulo, vê overlay de zona R, C ou I, e consegue sobrepor para corrigir o tipo.

## 3. Regras de negócio

- RN1: Ferramenta **Zona** com três tipos: **residencial**, **comercial**, **industrial**.
- RN2: O gesto define um rectângulo inclusivo de tiles entre o canto inicial e o canto final.
- RN3: Cada tile do rectângulo recebe `zone` correspondente; um tipo novo **substitui** o anterior.
- RN4: Zonar **não** cria edifícios.
- RN5: 🔶 Não se zona tiles `water` nem `mountain`; essas tiles são saltadas e o resto do rectângulo aplica-se.
- RN6: 🔶 Tiles com estrada **podem** ser zonadas (a zona fica na tile; a estrada permanece).
- RN7: Rectângulo de uma única tile é válido.
- RN8: A acção é um comando da engine; a ferramenta não escreve no mundo directamente.

## 4. Critérios de aceitação (Gherkin)

### CA1: Zonar um rectângulo residencial
```gherkin
Dado que a ferramenta Zona está activa no tipo residencial
E as tiles de (1, 1) a (3, 2) são grass sem zona
Quando confirmo o rectângulo de (1, 1) até (3, 2)
Então as seis tiles ficam com zona residencial
E o canvas mostra um overlay distinto para residencial
E nenhum edifício é criado
```

### CA2: Substituir zona existente
```gherkin
Dado que as tiles (0, 0) e (1, 0) já são residenciais
E a ferramenta Zona está no tipo industrial
Quando confirmo o rectângulo que cobre (0, 0) e (1, 0)
Então essas tiles passam a industriais
E o overlay visual actualiza para industrial
```

### CA3: Água e montanha são saltadas
```gherkin
Dado um rectângulo que contém uma tile water e tiles grass
Quando confirmo a zona comercial
Então as tiles grass do rectângulo ficam comerciais
E a tile water permanece sem zona comercial
E o comando não é rejeitado por inteiro
```

### CA4: Ferramenta errada não zona
```gherkin
Dado que a ferramenta Select está activa
Quando arrasto um rectângulo sobre o mapa
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
- Demanda R/C/I no HUD (E3).

## 6. Dependências

- **Bloqueia:** US-204 (opcionalmente exigir zona compatível — ver ❓)
- **Bloqueada por:** US-201
- **Relacionada:** US-202, US-205, US-206

## 7. Requisitos não-funcionais

- **Performance:** zonar até 64×64 tiles num comando sem montar nós React por tile.
- **Segurança/Privacidade:** não aplicável.
- **Acessibilidade:** os três tipos não se distinguem só por vermelho/azul/amarelo clássico; incluir padrão ou ícone + texto (`Residencial`, `Comercial`, `Industrial`).
- **Observabilidade:** comando testável; overlay de zona visível com debug desligado.
- **Internacionalização:** UI em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] RN5 (saltar vs recusar o rectângulo inteiro) confirmado
- [ ] Paleta: um botão “Zona” + subtipo vs três ferramentas
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes headless (rectângulo, substituição, skip de água, tile única) a passar
- [ ] Overlay de zona no Canvas
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Rectângulo com água: **aplicar o válido e saltar o inválido**, não falhar o comando todo — melhor para pintar bairros à beira-rio.
- ❓ Edifício na US-204 exige zona compatível, ou pode ser colocado em qualquer grass vazia neste sandbox?
- ❓ Cores clássicas R/C/I (verde/azul/amarelo) são aceitáveis se acompanhadas de padrão?
