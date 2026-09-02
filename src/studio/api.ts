import type { Asset } from "../lib/assets";
import type { Content, MediaEntry } from "../lib/content";
import { kindFromExtension } from "../lib/content";
import {
  CONTENT_ROW_ID,
  CONTENT_TABLE,
  MEDIA_BUCKET,
  explainError,
  supabase,
} from "../lib/supabase";

/**
 * O estúdio grava em um de dois lugares.
 *
 * **Supabase**, quando configurado: funciona em qualquer computador e vale para
 * a apresentação publicada. Exige estar logado.
 *
 * **Servidor de desenvolvimento**, quando não há Supabase: grava direto na
 * pasta do projeto. Só funciona em `npm run dev`.
 *
 * A escolha é feita uma vez, aqui, e o resto do estúdio não precisa saber.
 */

const LOCAL_API = "/api/studio";

export const backend: "supabase" | "local" = supabase ? "supabase" : "local";

/* -------------------------------------------------------------------------- */
/* Sessão                                                                     */
/* -------------------------------------------------------------------------- */

export type Session = { email: string } | null;

export async function currentSession(): Promise<Session> {
  if (!supabase) return { email: "modo local" };
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  return email ? { email } : null;
}

export function onSessionChange(handler: (session: Session) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(session?.user.email ? { email: session.user.email } : null);
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(explainError(error));
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/* -------------------------------------------------------------------------- */
/* Conteúdo                                                                   */
/* -------------------------------------------------------------------------- */

export async function fetchContent(): Promise<Content> {
  if (supabase) {
    const { data, error } = await supabase
      .from(CONTENT_TABLE)
      .select("media")
      .eq("id", CONTENT_ROW_ID)
      .maybeSingle();

    if (error) throw new Error(explainError(error));
    return { media: (data?.media ?? {}) as Content["media"] };
  }

  const response = await fetch(`${LOCAL_API}/content`, { cache: "no-store" });
  if (!response.ok) throw new Error("Não consegui ler o content.json");
  return response.json();
}

export async function saveContent(content: Content): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from(CONTENT_TABLE)
      .upsert({ id: CONTENT_ROW_ID, media: content.media }, { onConflict: "id" });

    if (error) throw new Error(explainError(error));
    return;
  }

  const response = await fetch(`${LOCAL_API}/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw new Error("Não consegui gravar o content.json");
}

/* -------------------------------------------------------------------------- */
/* Arquivos                                                                   */
/* -------------------------------------------------------------------------- */

export async function uploadFile(asset: Asset, file: File): Promise<MediaEntry> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const base = asset.src.split("/").pop() ?? asset.id;
  const kind = kindFromExtension(file.name);

  if (supabase) {
    const path = `${asset.folder}/${base}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) throw new Error(explainError(error));
    return { file: path, kind, storage: true, updatedAt: Date.now() };
  }

  const params = new URLSearchParams({ folder: asset.folder, name: base, ext });
  const response = await fetch(`${LOCAL_API}/upload?${params}`, { method: "POST", body: file });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Falha no envio");

  return { file: data.file as string, kind, updatedAt: Date.now() };
}

export async function removeFile(entry: Pick<MediaEntry, "file" | "storage">): Promise<void> {
  if (entry.storage) {
    if (!supabase) return;
    await supabase.storage.from(MEDIA_BUCKET).remove([entry.file]);
    return;
  }

  /* Arquivo local: só o servidor de desenvolvimento consegue apagar. */
  if (supabase) return;

  await fetch(`${LOCAL_API}/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: entry.file }),
  });
}
