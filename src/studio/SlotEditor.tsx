import { useRef, useState } from "react";
import { Film, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import type { Asset } from "../lib/assets";
import { ASSETS_URL, type MediaEntry } from "../lib/content";

/** Um encaixe de mídia no painel do estúdio. */
export function SlotEditor({
  asset,
  entry,
  onUpload,
  onChange,
  onRemove,
}: {
  asset: Asset;
  entry?: MediaEntry;
  onUpload: (file: File) => Promise<void>;
  onChange: (patch: Partial<MediaEntry>) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <section className="rounded-2xl bg-white/[0.025] p-4 ring-1 ring-white/[0.06]">
      <header className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold tracking-tight text-chalk">{asset.title}</h3>
          <p className="mt-0.5 text-[12px] text-faint">{asset.where}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-faint">
          {asset.ratio.split(" — ")[0]}
        </span>
      </header>

      <div className="flex gap-3">
        <Thumb entry={entry} />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="min-w-0">
            {entry ? (
              <>
                <p className="flex items-center gap-1.5 truncate text-[12px] text-mute">
                  {entry.kind === "video" ? <Film size={13} /> : <ImageIcon size={13} />}
                  <span className="truncate">{entry.file.split("/").pop()}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-faint">
                  {entry.kind === "video" ? "vídeo — toca sozinho, mudo, em loop" : "imagem"}
                </p>
              </>
            ) : (
              <p className="text-[12px] leading-snug text-faint">
                Vazio. A apresentação mostra{" "}
                <span className="font-mono text-[11px]">{asset.label}</span>.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-chalk px-3 py-1.5 text-[12px]
                         font-medium text-ink-950 transition hover:bg-white disabled:opacity-50"
            >
              <Upload size={13} />
              {busy ? "enviando…" : entry ? "Trocar" : "Enviar arquivo"}
            </button>

            {entry && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]
                           text-mute ring-1 ring-white/[0.08] transition hover:text-chalk"
              >
                <Trash2 size={13} />
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*,video/mp4,video/webm"
        hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}

      {entry && (
        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
          <Slider
            label="Zoom"
            value={entry.zoom ?? 1}
            min={1}
            max={3}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(zoom) => onChange({ zoom })}
          />
          <Slider
            label="Horizontal"
            value={entry.x ?? 50}
            min={0}
            max={100}
            step={1}
            format={(v) => `${Math.round(v)}%`}
            onChange={(x) => onChange({ x })}
          />
          <Slider
            label="Vertical"
            value={entry.y ?? 50}
            min={0}
            max={100}
            step={1}
            format={(v) => `${Math.round(v)}%`}
            onChange={(y) => onChange({ y })}
          />

          <p className="pt-1 text-[11px] leading-relaxed text-faint">
            Marque abaixo só se o arquivo já for a foto de um celular. Desmarcado, a
            apresentação desenha o iPhone 15 Pro Max e a mídia ocupa só a tela.
          </p>
          <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-mute">
            <input
              type="checkbox"
              checked={entry.prewrapped ?? asset.prewrapped ?? false}
              onChange={(e) => onChange({ prewrapped: e.target.checked })}
              className="h-3.5 w-3.5 accent-[#9cc4ff]"
            />
            A mídia já vem com um aparelho desenhado dentro
          </label>
        </div>
      )}
    </section>
  );
}

function Thumb({ entry }: { entry?: MediaEntry }) {
  const box =
    "grid h-[104px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-900 ring-1 ring-white/[0.07]";

  if (!entry) {
    return (
      <div className={box}>
        <ImageIcon size={18} className="text-faint" />
      </div>
    );
  }

  const src = `${ASSETS_URL}/${entry.file}?v=${entry.updatedAt ?? 0}`;

  return (
    <div className={box}>
      {entry.kind === "video" ? (
        <video src={src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
      ) : (
        <img src={src} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[12px] text-mute">
        {label}
        <span className="font-mono text-[11px] tabular-nums text-faint">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#9cc4ff]"
      />
    </label>
  );
}
