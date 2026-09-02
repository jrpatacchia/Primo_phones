import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { assetList } from "../lib/assets";
import type { AssetKey } from "../lib/assets";
import { EMPTY_CONTENT, type Content, type MediaEntry } from "../lib/content";
import { SLIDE_COUNT } from "../lib/presentation";
import { fetchContent, removeFile, saveContent, uploadFile } from "./api";
import { SlotEditor } from "./SlotEditor";

const DEVICES = {
  celular: { width: 390, height: 844, icon: Smartphone },
  tablet: { width: 834, height: 1112, icon: Tablet },
  desktop: { width: 1280, height: 820, icon: Monitor },
} as const;

type Device = keyof typeof DEVICES;
type Status = "pronto" | "salvando" | "erro";

/**
 * Estúdio: troca as mídias da apresentação e mostra o resultado ao vivo.
 * Só roda em `npm run dev` — na apresentação publicada esta rota não existe.
 */
export default function Studio() {
  const [content, setContent] = useState<Content>(EMPTY_CONTENT);
  const [status, setStatus] = useState<Status>("pronto");
  const [slide, setSlide] = useState(1);
  const [device, setDevice] = useState<Device>("celular");
  const [version, setVersion] = useState(0);
  const [edits, setEdits] = useState(0);

  useEffect(() => {
    fetchContent()
      .then((data) => setContent({ media: data.media ?? {} }))
      .catch(() => setStatus("erro"));
  }, []);

  /* Salva sozinho, com uma pausa para não gravar a cada arrastada de slider. */
  useEffect(() => {
    /* Nada foi editado ainda: não grava por cima do que veio do servidor. */
    if (edits === 0) return;

    setStatus("salvando");
    const timer = window.setTimeout(async () => {
      try {
        await saveContent(content);
        setStatus("pronto");
        setVersion((v) => v + 1);
      } catch {
        setStatus("erro");
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [content, edits]);

  const patch = useCallback((id: AssetKey, entry: MediaEntry | undefined) => {
    setEdits((n) => n + 1);
    setContent((current) => {
      const media = { ...current.media };
      if (entry) media[id] = entry;
      else delete media[id];
      return { media };
    });
  }, []);

  const preview = useMemo(() => `/?slide=${slide}&studio=${version}`, [slide, version]);

  return (
    <div className="flex h-dvh bg-ink-950 text-chalk">
      {/* Painel */}
      <aside className="flex w-[400px] shrink-0 flex-col border-r border-white/[0.07]">
        <header className="border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h1 className="text-[15px] font-semibold tracking-tight">Estúdio</h1>
            <StatusDot status={status} />
          </div>
          <p className="mt-1 text-[12px] leading-snug text-faint">
            Troque as imagens e vídeos das áreas de mockup. Tudo é salvo sozinho em{" "}
            <span className="font-mono text-[11px]">content.json</span>.
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {assetList.map((asset) => (
            <SlotEditor
              key={asset.id}
              asset={asset}
              entry={content.media[asset.id]}
              onUpload={async (file) => {
                const previous = content.media[asset.id];
                const entry = await uploadFile(asset, file);
                if (previous?.file && previous.file !== entry.file) {
                  await removeFile(previous.file);
                }
                patch(asset.id, {
                  ...entry,
                  zoom: previous?.zoom,
                  x: previous?.x,
                  y: previous?.y,
                  prewrapped: previous?.prewrapped ?? asset.prewrapped,
                });
              }}
              onChange={(changes) => {
                const entry = content.media[asset.id];
                if (entry) patch(asset.id, { ...entry, ...changes });
              }}
              onRemove={async () => {
                const entry = content.media[asset.id];
                patch(asset.id, undefined);
                if (entry?.file) await removeFile(entry.file);
              }}
            />
          ))}

          <p className="px-1 pb-2 pt-3 text-[12px] leading-relaxed text-faint">
            Depois de trocar as mídias, rode{" "}
            <span className="font-mono text-[11px] text-mute">npm run optimize</span> para comprimir
            as imagens antes de mandar a apresentação para alguém.
          </p>
        </div>
      </aside>

      {/* Prévia */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSlide(n)}
                className={`h-8 w-9 rounded-lg font-mono text-[12px] tabular-nums transition ${
                  n === slide
                    ? "bg-white/[0.1] text-chalk"
                    : "text-faint hover:bg-white/[0.05] hover:text-mute"
                }`}
              >
                {String(n).padStart(2, "0")}
              </button>
            ))}
          </div>

          <span className="h-5 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-1">
            {(Object.keys(DEVICES) as Device[]).map((key) => {
              const Icon = DEVICES[key].icon;
              return (
                <button
                  key={key}
                  type="button"
                  title={key}
                  onClick={() => setDevice(key)}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    key === device
                      ? "bg-white/[0.1] text-chalk"
                      : "text-faint hover:bg-white/[0.05] hover:text-mute"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.7} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            title="Recarregar prévia"
            onClick={() => setVersion((v) => v + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-white/[0.05] hover:text-mute"
          >
            <RotateCcw size={15} strokeWidth={1.7} />
          </button>

          <div className="ml-auto flex items-center gap-4 text-[12px]">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-mute hover:text-chalk"
            >
              Apresentação <ExternalLink size={12} />
            </a>
            <a
              href={`/presentation?slide=${slide}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-mute hover:text-chalk"
            >
              Captura 1080×1920 <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <Preview src={preview} device={device} />
      </main>
    </div>
  );
}

/** A prévia é a apresentação de verdade, dentro de um iframe redimensionado. */
function Preview({ src, device }: { src: string; device: Device }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { width, height } = DEVICES[device];

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const measure = () => {
      const box = el.getBoundingClientRect();
      setScale(Math.min(1, (box.width - 64) / width, (box.height - 64) / height));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  return (
    <div ref={host} className="relative flex-1 overflow-hidden bg-[#0b0b0d]">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <iframe
          key={src}
          src={src}
          title="Prévia da apresentação"
          className="h-full w-full rounded-[18px] border-0 bg-black"
          style={{ boxShadow: "0 40px 100px -40px rgba(0,0,0,0.9)" }}
        />
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  const text = status === "salvando" ? "salvando…" : status === "erro" ? "erro ao salvar" : "salvo";
  const color =
    status === "salvando" ? "bg-[#9cc4ff]" : status === "erro" ? "bg-red-400" : "bg-[#25d366]";

  return (
    <span className="flex items-center gap-2 text-[12px] text-faint">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {text}
    </span>
  );
}
