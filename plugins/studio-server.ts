import { promises as fs } from "node:fs";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import type { Connect, Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Servidor do estúdio.
 *
 * Só existe em `npm run dev` (`apply: "serve"`). A apresentação publicada é
 * 100% estática: não vai um byte disto para o `dist/`.
 *
 *   GET    /api/studio/content   lê o content.json
 *   PUT    /api/studio/content   grava o content.json
 *   POST   /api/studio/upload    grava um arquivo em public/presentation/assets
 *   POST   /api/studio/remove    apaga um arquivo enviado
 */

const ASSETS_DIR = path.resolve("public/presentation/assets");
const CONTENT_FILE = path.resolve("public/presentation/content.json");

/** Só estes formatos entram. */
const ALLOWED = ["webp", "png", "jpg", "jpeg", "avif", "gif", "svg", "mp4", "webm"] as const;

/** Teto por arquivo. Um vídeo maior que isso não deveria ir para o celular. */
const MAX_BYTES = 120 * 1024 * 1024;

export function studioServer(): Plugin {
  return {
    name: "studio-server",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/studio", ((req, res, next) =>
        handler(req, res, next, server)) as Connect.NextHandleFunction);

      /*
       * Servimos /presentation/ nós mesmos. O Vite monta a lista de arquivos de
       * public/ ao iniciar e a mantém pelo observador — e o observador está
       * desligado nessa pasta (senão a página recarregaria a cada envio). Sem
       * isto, um arquivo enviado agora só apareceria depois de reiniciar.
       */
      server.middlewares.use("/presentation", serveMedia as Connect.NextHandleFunction);
    },
  };
}

async function handler(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
  server: ViteDevServer,
) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const route = url.pathname.replace(/^\/+|\/+$/g, "");

  try {
    if (route === "content" && req.method === "GET") {
      return json(res, 200, (await readContent()) ?? (await seedFromDisk(server)));
    }

    if (route === "content" && req.method === "PUT") {
      const body = JSON.parse((await readBody(req)).toString("utf8"));
      const content = { media: body?.media ?? {} };
      await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
      await fs.writeFile(CONTENT_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf8");
      return json(res, 200, content);
    }

    if (route === "upload" && req.method === "POST") {
      const folder = sanitizeSegment(url.searchParams.get("folder") ?? "");
      const name = sanitizeSegment(url.searchParams.get("name") ?? "");
      const ext = (url.searchParams.get("ext") ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!folder || !name) return json(res, 400, { error: "folder e name são obrigatórios" });
      if (!(ALLOWED as readonly string[]).includes(ext)) {
        return json(res, 400, { error: `formato .${ext} não aceito` });
      }

      const target = path.join(ASSETS_DIR, folder, `${name}-${Date.now()}.${ext}`);
      if (!inside(ASSETS_DIR, target)) return json(res, 400, { error: "caminho inválido" });

      const body = await readBody(req);
      if (!body.length) return json(res, 400, { error: "arquivo vazio" });

      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body);

      return json(res, 200, {
        file: path.relative(ASSETS_DIR, target).split(path.sep).join("/"),
        bytes: body.length,
      });
    }

    if (route === "remove" && req.method === "POST") {
      const { file } = JSON.parse((await readBody(req)).toString("utf8")) as { file?: string };
      if (!file) return json(res, 400, { error: "file é obrigatório" });

      const target = path.join(ASSETS_DIR, file);
      if (!inside(ASSETS_DIR, target)) return json(res, 400, { error: "caminho inválido" });
      if (existsSync(target)) await fs.unlink(target);

      return json(res, 200, { ok: true });
    }
  } catch (error) {
    return json(res, 500, { error: String(error) });
  }

  next();
}

async function readContent() {
  try {
    return JSON.parse(await fs.readFile(CONTENT_FILE, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Sem content.json ainda: monta um a partir dos arquivos já soltos na pasta,
 * para o estúdio abrir mostrando o que a apresentação realmente exibe.
 */
async function seedFromDisk(server: ViteDevServer) {
  const media: Record<string, unknown> = {};

  try {
    const mod = (await server.ssrLoadModule("/src/lib/assets.ts")) as {
      assetList: Array<{ id: string; src: string; folder: string; prewrapped?: boolean }>;
    };

    for (const asset of mod.assetList) {
      const base = asset.src.split("/").pop();
      if (!base) continue;

      for (const ext of ALLOWED) {
        const candidate = path.join(ASSETS_DIR, asset.folder, `${base}.${ext}`);
        if (!existsSync(candidate)) continue;

        media[asset.id] = {
          file: `${asset.folder}/${base}.${ext}`,
          kind: ext === "mp4" || ext === "webm" ? "video" : "image",
          prewrapped: asset.prewrapped ?? false,
          updatedAt: Math.round((await fs.stat(candidate)).mtimeMs),
        };
        break;
      }
    }
  } catch {
    /* Se o módulo não carregar, o estúdio abre vazio — nada quebra. */
  }

  return { media };
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(new Error(`arquivo acima de ${Math.round(MAX_BYTES / 1024 / 1024)} MB`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "");
}

function inside(root: string, target: string) {
  const rel = path.relative(root, target);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

const MIME: Record<string, string> = {
  json: "application/json; charset=utf-8",
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

/** Servidor estático de public/presentation, com suporte a Range para vídeo. */
function serveMedia(req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) {
  const root = path.resolve("public/presentation");
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const target = path.join(root, pathname);

  if (!inside(root, target) || !existsSync(target) || !statSync(target).isFile()) return next();

  const ext = path.extname(target).slice(1).toLowerCase();
  const total = statSync(target).size;

  res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Accept-Ranges", "bytes");

  const range = /^bytes=(d*)-(d*)$/.exec(req.headers.range ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : total - 1;

    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    res.setHeader("Content-Length", end - start + 1);
    createReadStream(target, { start, end }).pipe(res);
    return;
  }

  res.setHeader("Content-Length", total);
  createReadStream(target).pipe(res);
}
