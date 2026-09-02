import type { AssetKey } from "./assets";

/**
 * Conteúdo editável da apresentação.
 *
 * Fica em `public/presentation/content.json`. É escrito pelo estúdio (`/studio`)
 * e lido pela apresentação no carregamento. Em produção é só um arquivo estático
 * a mais — não existe servidor nem banco.
 */

export type MediaKind = "image" | "video";

export type MediaEntry = {
  /** Caminho do arquivo COM extensão, relativo a `public/presentation/assets/`. */
  file: string;
  kind: MediaKind;
  /** Enquadramento: 1 = imagem inteira. */
  zoom?: number;
  /** Ponto de interesse em %, 0–100. */
  x?: number;
  y?: number;
  /** true quando a mídia já traz a moldura do aparelho desenhada. */
  prewrapped?: boolean;
  /** Imagem de pôster do vídeo, mesmo formato de `file`. */
  poster?: string;
  /** Momento do último envio — usado para furar o cache do navegador. */
  updatedAt?: number;
};

export type Content = {
  media: Partial<Record<AssetKey, MediaEntry>>;
};

export const EMPTY_CONTENT: Content = { media: {} };

export const CONTENT_URL = "/presentation/content.json";
export const ASSETS_URL = "/presentation/assets";

let current: Content = EMPTY_CONTENT;

/** Lê o content.json. Chamado uma vez, antes de renderizar. */
export async function loadContent(): Promise<Content> {
  try {
    const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return current;
    const data = (await response.json()) as Partial<Content>;
    current = { media: data.media ?? {} };
  } catch {
    /* Sem content.json a apresentação usa os arquivos soltos na pasta. */
  }
  return current;
}

export function getContent(): Content {
  return current;
}

export function setContent(next: Content) {
  current = next;
}

/** O que foi definido para um encaixe, ou undefined se ainda estiver vazio. */
export function getMedia(id: AssetKey): MediaEntry | undefined {
  return current.media[id];
}

/** URL final de um arquivo do content.json, com quebra de cache. */
export function mediaUrl(entry: Pick<MediaEntry, "file" | "updatedAt">): string {
  const version = entry.updatedAt ? `?v=${entry.updatedAt}` : "";
  return `${ASSETS_URL}/${entry.file}${version}`;
}

export const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif"] as const;
export const VIDEO_EXTENSIONS = ["mp4", "webm"] as const;

export function kindFromExtension(name: string): MediaKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext) ? "video" : "image";
}
