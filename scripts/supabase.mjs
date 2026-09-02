/**
 * Ferramentas de linha de comando do Supabase.
 *
 *   npm run supabase:check     confere se a estrutura já existe
 *   npm run supabase:migrate   sobe as mídias locais e grava o conteúdo
 *
 * O migrate precisa de um usuário — as políticas só deixam quem está logado
 * escrever. Crie um em Authentication → Users → Add user (marcando Auto Confirm
 * User) e passe as credenciais:
 *
 *   SUPABASE_EMAIL=voce@exemplo.com SUPABASE_PASSWORD=... npm run supabase:migrate
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ENV_FILE = ".env";
const ASSETS_DIR = "public/presentation/assets";
const CONTENT_FILE = "public/presentation/content.json";
const TABLE = "presentation_content";
const ROW_ID = "default";
const BUCKET = "presentation";

const MIME = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};

const env = await readEnv();
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  fail("Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.");
}

const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
const command = process.argv[2] ?? "check";

if (command === "check") await check();
else if (command === "migrate") await migrate();
else fail(`Comando desconhecido: ${command}. Use check ou migrate.`);

/* -------------------------------------------------------------------------- */

async function check() {
  console.log(`Projeto: ${url}\n`);

  const table = await supabase.from(TABLE).select("id, updated_at").eq("id", ROW_ID).maybeSingle();
  if (table.error) {
    report("tabela presentation_content", false, table.error.message);
  } else if (!table.data) {
    report("tabela presentation_content", false, "existe, mas a linha 'default' não foi criada");
  } else {
    report("tabela presentation_content", true, `linha 'default', atualizada em ${table.data.updated_at}`);
  }

  /*
   * list() devolve lista vazia mesmo sem o bucket existir. Baixar um caminho
   * inventado é o que separa "bucket não existe" de "arquivo não existe".
   */
  const probe = await supabase.storage.from(BUCKET).download("__sonda__");
  const missingBucket = /NoSuchBucket|Bucket not found/i.test(probe.error?.message ?? "");
  report(
    "bucket presentation",
    !missingBucket,
    missingBucket ? "não existe" : "leitura pública funcionando",
  );

  const media = table.data ? await supabase.from(TABLE).select("media").eq("id", ROW_ID).single() : null;
  const count = media?.data ? Object.keys(media.data.media ?? {}).length : 0;
  console.log(`\n${count} ${count === 1 ? "área preenchida" : "áreas preenchidas"} no Supabase.`);

  if (table.error || !table.data || missingBucket) {
    console.log("\nFalta rodar supabase/schema.sql no SQL Editor do painel do Supabase.");
    process.exitCode = 1;
  }
}

async function migrate() {
  const email = process.env.SUPABASE_EMAIL;
  const password = process.env.SUPABASE_PASSWORD;

  if (!email || !password) {
    fail(
      "Defina SUPABASE_EMAIL e SUPABASE_PASSWORD.\n" +
        "Crie o usuário em Authentication → Users → Add user, com Auto Confirm User marcado.",
    );
  }

  const auth = await supabase.auth.signInWithPassword({ email, password });
  if (auth.error) fail(`Não consegui entrar: ${auth.error.message}`);
  console.log(`Logado como ${email}\n`);

  if (!existsSync(CONTENT_FILE)) fail(`${CONTENT_FILE} não existe — nada para migrar.`);
  const local = JSON.parse(await readFile(CONTENT_FILE, "utf8"));
  const entries = Object.entries(local.media ?? {});

  if (!entries.length) fail("O content.json local está vazio — nada para migrar.");

  const media = {};
  let sent = 0;
  let bytes = 0;

  for (const [id, entry] of entries) {
    if (entry.storage) {
      media[id] = entry;
      console.log(`${id.padEnd(18)} já está no Supabase`);
      continue;
    }

    const source = join(ASSETS_DIR, entry.file);
    if (!existsSync(source)) {
      console.log(`${id.padEnd(18)} arquivo local não encontrado, pulando (${entry.file})`);
      continue;
    }

    const body = await readFile(source);
    const ext = extname(source).slice(1).toLowerCase();
    const path = entry.file;

    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType: MIME[ext] ?? "application/octet-stream",
      cacheControl: "31536000",
      upsert: true,
    });

    if (error) fail(`Falha ao enviar ${path}: ${error.message}`);

    media[id] = { ...entry, file: path, storage: true, updatedAt: Date.now() };
    sent += 1;
    bytes += body.length;
    console.log(`${id.padEnd(18)} ${mb(body.length)} → ${path}`);
  }

  const { error } = await supabase.from(TABLE).upsert({ id: ROW_ID, media }, { onConflict: "id" });
  if (error) fail(`Falha ao gravar o conteúdo: ${error.message}`);

  await writeFile(CONTENT_FILE, `${JSON.stringify({ media }, null, 2)}\n`, "utf8");

  console.log(`\n${sent} ${sent === 1 ? "arquivo enviado" : "arquivos enviados"}, ${mb(bytes)} no total.`);
  console.log("O content.json local foi atualizado para apontar para o Supabase.");

  if (bytes > 20 * 1024 * 1024) {
    console.log(
      `\nAtenção: ${mb(bytes)} de mídia. O plano gratuito do Supabase dá 5 GB de tráfego por mês,\n` +
        `o que dá cerca de ${Math.floor((5 * 1024) / (bytes / 1024 / 1024))} aberturas da apresentação. Vale comprimir os vídeos.`,
    );
  }

  await supabase.auth.signOut();
}

/* -------------------------------------------------------------------------- */

async function readEnv() {
  if (!existsSync(ENV_FILE)) return {};
  const text = await readFile(ENV_FILE, "utf8");
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const at = line.indexOf("=");
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      }),
  );
}

function report(what, ok, detail) {
  console.log(`${ok ? "ok  " : "erro"}  ${what.padEnd(30)} ${detail}`);
}

function mb(bytes) {
  return bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

