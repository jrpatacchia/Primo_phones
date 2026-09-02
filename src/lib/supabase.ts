import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Ligação com o Supabase.
 *
 * Sem as variáveis de ambiente, `supabase` é null e o projeto inteiro continua
 * funcionando do jeito antigo: a apresentação lê os arquivos de
 * `public/presentation/` e o estúdio grava em disco pelo servidor de
 * desenvolvimento. Nada quebra por falta de conexão.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const CONTENT_TABLE = "presentation_content";
export const CONTENT_ROW_ID = "default";
export const MEDIA_BUCKET = "presentation";

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "apresentacao-studio-auth",
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;

/** URL pública de um arquivo do bucket. */
export function storageUrl(path: string): string {
  if (!supabase) return path;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Traduz os erros mais comuns para algo acionável.
 * Sem isto o estúdio mostraria "relation does not exist" para quem só quer
 * saber que falta rodar o SQL.
 */
export function explainError(error: { message?: string; code?: string } | null): string {
  const message = error?.message ?? "Erro desconhecido";

  if (/schema cache|does not exist|PGRST205/i.test(message)) {
    return "A tabela ainda não existe. Rode supabase/schema.sql no SQL Editor do Supabase.";
  }
  if (/Bucket not found/i.test(message)) {
    return "O bucket de mídias ainda não existe. Rode supabase/schema.sql no SQL Editor do Supabase.";
  }
  if (/row-level security|Unauthorized|JWT/i.test(message)) {
    return "Sem permissão. Entre com seu e-mail e senha para poder salvar.";
  }
  if (/Invalid login credentials/i.test(message)) {
    return "E-mail ou senha incorretos.";
  }
  if (/Email not confirmed/i.test(message)) {
    return "Esse e-mail ainda não foi confirmado no Supabase.";
  }
  return message;
}
