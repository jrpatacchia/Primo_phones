/**
 * Comprime as capturas de `public/presentation/assets/`.
 *
 *   npm run optimize
 *
 * Converte cada PNG/JPG para `.webp`, redimensionando para o tamanho em que a
 * imagem realmente aparece na apresentação. Os originais vão para
 * `assets-originais/`, fora do `public/`.
 *
 * O `content.json` é atualizado junto: o que o estúdio apontava para o PNG
 * passa a apontar para o WEBP. Vídeos não são tocados.
 */
import { readdir, mkdir, rename, stat, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, basename, dirname, relative } from "node:path";
import sharp from "sharp";

const ROOT = "public/presentation/assets";
const CONTENT = "public/presentation/content.json";
const BACKUP = "assets-originais";

/** Largura máxima em que cada tipo de captura é exibida (com folga de 2×). */
const MAX_WIDTH = { tall: 1000, portrait: 1000, wide: 1600, square: 512 };

const files = [];
for await (const entry of walk(ROOT)) {
  if (![".png", ".jpg", ".jpeg"].includes(extname(entry).toLowerCase())) continue;
  files.push(entry);
}

if (!files.length) {
  console.log("Nada para comprimir em", ROOT);
  process.exit(0);
}

await mkdir(BACKUP, { recursive: true });

/** De → para, para consertar o content.json no fim. */
const renamed = new Map();

for (const file of files) {
  const { size } = await stat(file);
  const image = sharp(file);
  const meta = await image.metadata();
  const ratio = (meta.height ?? 1) / (meta.width ?? 1);
  const max =
    ratio > 1.6 ? MAX_WIDTH.tall
    : ratio > 1.05 ? MAX_WIDTH.portrait
    : ratio > 0.9 ? MAX_WIDTH.square
    : MAX_WIDTH.wide;

  const out = join(dirname(file), `${basename(file, extname(file))}.webp`);

  await image
    .resize({ width: Math.min(meta.width ?? max, max), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(out);

  const after = (await stat(out)).size;

  const parked = join(BACKUP, relative(ROOT, file));
  await mkdir(dirname(parked), { recursive: true });
  if (!existsSync(parked)) await rename(file, parked);

  renamed.set(rel(file), rel(out));

  console.log(
    `${rel(out).padEnd(46)} ${kb(size)} → ${kb(after)}  (${Math.round((1 - after / size) * 100)}% menor)`,
  );
}

await updateContent(renamed);

console.log(`\nOriginais preservados em ${BACKUP}`);

/** Faz o content.json acompanhar os arquivos que mudaram de extensão. */
async function updateContent(map) {
  if (!existsSync(CONTENT)) return;

  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  let changed = 0;

  for (const entry of Object.values(content.media ?? {})) {
    const target = map.get(entry.file);
    if (!target) continue;
    entry.file = target;
    entry.updatedAt = Date.now();
    changed += 1;
  }

  if (changed) {
    await writeFile(CONTENT, `${JSON.stringify(content, null, 2)}\n`, "utf8");
    console.log(`\ncontent.json atualizado: ${changed} ${changed === 1 ? "mídia" : "mídias"}`);
  }
}

function rel(file) {
  return relative(ROOT, file).split(/[\\/]/).join("/");
}

function kb(bytes) {
  return `${String(Math.round(bytes / 1024)).padStart(5)} KB`;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}
