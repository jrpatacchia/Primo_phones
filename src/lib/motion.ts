import { readRoute } from "./presentation";

/**
 * No modo captura (/presentation) a tela precisa nascer no estado final:
 * um screenshot não espera animação terminar.
 */
export const STILL = typeof window !== "undefined" && readRoute().mode === "capture";

/** Estado inicial de uma animação — desligado no modo captura. */
export function from<T>(value: T): T | false {
  return STILL ? false : value;
}
