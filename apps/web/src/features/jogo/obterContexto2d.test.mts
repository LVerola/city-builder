import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { obterContexto2d } from "./obterContexto2d.ts";

describe("obterContexto2d", () => {
  it("devolve null quando a superfície é nula", () => {
    assert.equal(obterContexto2d(null), null);
  });

  it("devolve null quando getContext devolve null", () => {
    const superficie = {
      getContext: () => null,
    };

    assert.equal(obterContexto2d(superficie), null);
  });

  it("devolve o contexto quando getContext devolve um contexto 2D", () => {
    const contexto = { canvas: {} } as CanvasRenderingContext2D;
    const superficie = {
      getContext: () => contexto,
    };

    assert.equal(obterContexto2d(superficie), contexto);
  });
});
