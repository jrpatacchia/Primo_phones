export const SLIDE_COUNT = 5;

/** Dimensões nativas do palco. Toda a composição é desenhada nesta grade. */
export const STAGE_W = 1080;
export const STAGE_H = 1920;

/** Tempo de cada tela no modo /demo. */
export const DEMO_INTERVAL_MS = 5200;

export type Mode = "deck" | "capture" | "demo" | "studio";

export type Route = {
  mode: Mode;
  /** Índice 0-based da tela isolada, ou null para exibir todas. */
  only: number | null;
  /** Índice 0-based inicial. */
  start: number;
};

/** Lê o modo e a tela a partir da URL: /presentation, /demo, ?slide=3, #3. */
export function readRoute(loc: Location = window.location): Route {
  const path = loc.pathname.replace(/\/+$/, "").toLowerCase();
  const params = new URLSearchParams(loc.search);

  const mode: Mode =
    path.endsWith("/studio") ? "studio"
    : path.endsWith("/demo") ? "demo"
    : path.endsWith("/presentation") || path.endsWith("/capture") ? "capture"
    : "deck";

  const raw = params.get("slide") ?? loc.hash.replace("#", "");
  const parsed = Number.parseInt(raw, 10);
  const index = Number.isFinite(parsed) ? clampIndex(parsed - 1) : null;

  return {
    mode,
    only: mode === "capture" ? index : null,
    start: index ?? 0,
  };
}

export function clampIndex(i: number) {
  return Math.min(SLIDE_COUNT - 1, Math.max(0, i));
}

export function formatCounter(i: number) {
  return `${String(i + 1).padStart(2, "0")} / ${String(SLIDE_COUNT).padStart(2, "0")}`;
}
