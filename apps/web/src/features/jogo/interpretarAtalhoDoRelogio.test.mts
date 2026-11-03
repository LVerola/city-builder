import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretarAtalhoDoRelogio } from "./interpretarAtalhoDoRelogio.ts";

describe("interpretarAtalhoDoRelogio", () => {
  it("Espaço alterna pausa", () => {
    assert.equal(interpretarAtalhoDoRelogio(" "), "alternar-pausa");
  });

  it("1, 2 e 4 seleccionam velocidade", () => {
    assert.equal(interpretarAtalhoDoRelogio("1"), 1);
    assert.equal(interpretarAtalhoDoRelogio("2"), 2);
    assert.equal(interpretarAtalhoDoRelogio("4"), 4);
  });

  it("outras teclas não mudam o relógio", () => {
    assert.equal(interpretarAtalhoDoRelogio("3"), null);
    assert.equal(interpretarAtalhoDoRelogio("a"), null);
  });
});
