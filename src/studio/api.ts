import type { Asset } from "../lib/assets";
import type { Content, MediaEntry } from "../lib/content";
import { kindFromExtension } from "../lib/content";

const API = "/api/studio";

export async function fetchContent(): Promise<Content> {
  const response = await fetch(`${API}/content`, { cache: "no-store" });
  if (!response.ok) throw new Error("Não consegui ler o content.json");
  return response.json();
}

export async function saveContent(content: Content): Promise<void> {
  const response = await fetch(`${API}/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw new Error("Não consegui gravar o content.json");
}

/** Envia o arquivo cru; o servidor cuida do nome e da pasta. */
export async function uploadFile(asset: Asset, file: File): Promise<MediaEntry> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const base = asset.src.split("/").pop() ?? asset.id;

  const params = new URLSearchParams({ folder: asset.folder, name: base, ext });
  const response = await fetch(`${API}/upload?${params}`, { method: "POST", body: file });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Falha no envio");

  return {
    file: data.file as string,
    kind: kindFromExtension(file.name),
    updatedAt: Date.now(),
  };
}

export async function removeFile(file: string): Promise<void> {
  await fetch(`${API}/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file }),
  });
}
