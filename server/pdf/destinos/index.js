// PDFs de roteiro por destino. Jerusalém tem módulo próprio (server/pdf/jerusalem.js), com as páginas de Terra Santa.
import { montarRoteiro } from "../roteiro.js";
import orlando from "./orlando.js";
import chile from "./chile.js";
import buenosAires from "./buenos-aires.js";

export const DESTINOS = { orlando, chile, "buenos-aires": buenosAires };

export function roteiroDestino(slug, nome, valores = {}) {
  const D = DESTINOS[slug];
  if (!D) throw new Error("destino sem roteiro: " + slug);
  return montarRoteiro(D, slug, nome, valores);
}
