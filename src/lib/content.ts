import type { AssetKey } from "./assets";
import { CONTENT_ROW_ID, CONTENT_TABLE, storageUrl, supabase } from "./supabase";

/**
 * Conteúdo editável da apresentação: qual mídia entra em cada área.
 *
 * Vive em dois lugares, nesta ordem de preferência:
 *
 * 1. **Supabase** — tabela `presentation_content` + bucket `presentation`.
 *    É o que faz o estúdio funcionar na apresentação publicada, de qualquer
 *    computador.
 * 2. **Arquivos locais** — `public/presentation/content.json` e a pasta
 *    `assets/`. Funciona sem internet e sem conta nenhuma.
 *
 * Se o Supabase não estiver configurado ou não responder, cai no local. A
 * apresentação nunca fica sem conteúdo por causa de rede.
 */

export type MediaKind = "image" | "video";

export type MediaEntry = {
  /**
   * Caminho do arquivo COM extensão. Relativo ao bucket quando `storage` é
   * true, ou a `public/presentation/assets/` quando não é.
   */
  file: string;
  kind: MediaKind;
  /** true quando o arquivo está hospedado no Supabase Storage. */
  storage?: boolean;
  /** Enquadramento: 1 = mídia inteira. */
  zoom?: number;
  /** Ponto de interesse em %, 0–100. */
  x?: number;
  y?: number;
  /** true quando a mídia já traz um aparelho desenhado dentro dela. */
  prewrapped?: boolean;
  /** Imagem de pôster do vídeo, no mesmo formato de `file`. */
  poster?: string;
  /** Momento do último envio — fura o cache do navegador. */
  updatedAt?: number;
};

export type Content = {
  media: Partial<Record<AssetKey, MediaEntry>>;
};

export type ContentSource = "supabase" | "local" | "vazio";

export const EMPTY_CONTENT: Content = { media: {} };

export const CONTENT_URL = "/presentation/content.json";
export const ASSETS_URL = "/presentation/assets";

let current: Content = EMPTY_CONTENT;
let source: ContentSource = "vazio";

/** Lê o conteúdo. Chamado uma vez, antes de renderizar. */
export async function loadContent(): Promise<Content> {
  const fromSupabase = await readFromSupabase();
  if (fromSupabase) {
    current = fromSupabase;
    source = "supabase";
    return current;
  }

  const local = await readFromFile();
  if (local) {
    current = local;
    source = "local";
  }
  return current;
}

async function readFromSupabase(): Promise<Content | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(CONTENT_TABLE)
      .select("media")
      .eq("id", CONTENT_ROW_ID)
      .maybeSingle();

    if (error || !data) return null;

    const media = (data.media ?? {}) as Content["media"];
    /* Linha existe mas ainda está vazia: o conteúdo local vale mais. */
    return Object.keys(media).length ? { media } : null;
  } catch {
    return null;
  }
}

async function readFromFile(): Promise<Content | null> {
  try {
    const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as Partial<Content>;
    return { media: data.media ?? {} };
  } catch {
    return null;
  }
}

export function getContent(): Content {
  return current;
}

export function getContentSource(): ContentSource {
  return source;
}

export function setContent(next: Content) {
  current = next;
}

/** O que foi definido para uma área, ou undefined se ainda estiver vazia. */
export function getMedia(id: AssetKey): MediaEntry | undefined {
  return current.media[id];
}

/** URL final de uma mídia, venha ela do Supabase ou da pasta local. */
export function mediaUrl(entry: Pick<MediaEntry, "file" | "storage" | "updatedAt">): string {
  const version = entry.updatedAt ? `?v=${entry.updatedAt}` : "";
  const base = entry.storage ? storageUrl(entry.file) : `${ASSETS_URL}/${entry.file}`;
  return `${base}${version}`;
}

export const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif"] as const;
export const VIDEO_EXTENSIONS = ["mp4", "webm"] as const;

export function kindFromExtension(name: string): MediaKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext) ? "video" : "image";
}
