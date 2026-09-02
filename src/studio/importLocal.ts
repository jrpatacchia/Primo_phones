import { assets, type AssetKey } from "../lib/assets";
import { ASSETS_URL, CONTENT_URL, type Content, type MediaEntry } from "../lib/content";
import { MEDIA_BUCKET, explainError, supabase } from "../lib/supabase";

/**
 * Leva para o Supabase as mídias que ainda estão em arquivo local.
 *
 * Roda no navegador, com a sessão de quem está logado — assim ninguém precisa
 * digitar senha em linha de comando, e as políticas de escrita são respeitadas
 * do mesmo jeito.
 */

export type PendingEntry = { id: AssetKey; entry: MediaEntry };

export type ImportProgress = {
  done: number;
  total: number;
  /** Nome da área sendo enviada agora. */
  current: string;
};

/** O que existe no content.json local e ainda não está no Supabase. */
export async function findLocalMedia(remote: Content): Promise<PendingEntry[]> {
  try {
    const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return [];

    const local = (await response.json()) as Partial<Content>;

    return Object.entries(local.media ?? {})
      .filter(([id, entry]) => {
        if (!entry?.file || entry.storage) return false;
        /* Já resolvido no Supabase: não mexe. */
        return !remote.media[id as AssetKey]?.storage;
      })
      .map(([id, entry]) => ({ id: id as AssetKey, entry: entry as MediaEntry }));
  } catch {
    return [];
  }
}

/** Envia cada arquivo pendente e devolve o conteúdo já apontando para o bucket. */
export async function importLocalMedia(
  remote: Content,
  pending: PendingEntry[],
  onProgress: (progress: ImportProgress) => void,
): Promise<Content> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const media = { ...remote.media };
  let done = 0;

  for (const { id, entry } of pending) {
    onProgress({ done, total: pending.length, current: assets[id]?.title ?? id });

    const file = await fetch(`${ASSETS_URL}/${entry.file}`);
    if (!file.ok) throw new Error(`Não achei o arquivo local ${entry.file}`);

    const blob = await file.blob();

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(entry.file, blob, {
      contentType: blob.type || undefined,
      cacheControl: "31536000",
      upsert: true,
    });

    if (error) throw new Error(explainError(error));

    media[id] = { ...entry, storage: true, updatedAt: Date.now() };
    done += 1;
  }

  onProgress({ done, total: pending.length, current: "" });
  return { media };
}

