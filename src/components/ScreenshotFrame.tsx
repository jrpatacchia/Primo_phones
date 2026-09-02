import { useState } from "react";
import type { Asset } from "../lib/assets";
import { ASSETS_URL, getMedia, mediaUrl } from "../lib/content";

export type Crop = {
  /** Zoom aplicado dentro do quadro. 1 = mídia inteira. */
  zoom?: number;
  /** Ponto de interesse em % (0 = topo/esquerda, 100 = base/direita). */
  x?: number;
  y?: number;
};

/** Extensões testadas quando o arquivo foi solto na pasta na mão. */
export const EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif", "mp4", "webm"] as const;

const VIDEO = /\.(mp4|webm)(\?|$)/i;

/**
 * Mostra a mídia de um encaixe: imagem, vídeo ou — enquanto nada foi definido —
 * um placeholder identificado. Nunca uma interface inventada.
 */
export function ScreenshotFrame({
  asset,
  crop,
  className = "",
  priority = false,
  fit = "cover",
}: {
  asset: Asset;
  crop?: Crop;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const entry = getMedia(asset.id);
  const [attempt, setAttempt] = useState(0);

  /* Sem nada no estúdio e sem arquivo solto na pasta: placeholder. */
  if (!entry && attempt >= EXTENSIONS.length) {
    return <Placeholder asset={asset} className={className} />;
  }

  const src = entry ? mediaUrl(entry) : `${asset.src}.${EXTENSIONS[attempt]}`;
  const isVideo = entry ? entry.kind === "video" : VIDEO.test(src);

  /*
   * O recorte é feito ampliando a própria mídia e deslocando-a, e não com
   * `transform: scale` — assim o enquadramento continua nítido e o navegador
   * não precisa compor uma camada escalada dentro de um `overflow: hidden`.
   */
  const zoom = entry?.zoom ?? crop?.zoom ?? 1;
  const x = entry?.x ?? crop?.x ?? 50;
  const y = entry?.y ?? crop?.y ?? 50;

  const geometry = {
    width: `${zoom * 100}%`,
    height: `${zoom * 100}%`,
    maxWidth: "none",
    maxHeight: "none",
    left: `${-(zoom - 1) * x}%`,
    top: `${-(zoom - 1) * y}%`,
    objectFit: fit,
    objectPosition: `${x}% ${y}%`,
  } as const;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-ink-900 ${className}`}>
      {isVideo ? (
        <video
          key={src}
          src={src}
          poster={entry?.poster ? `${ASSETS_URL}/${entry.poster}` : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          onError={() => !entry && setAttempt((a) => a + 1)}
          className="absolute"
          style={geometry}
        />
      ) : (
        <img
          key={src}
          src={src}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => !entry && setAttempt((a) => a + 1)}
          className="absolute"
          style={geometry}
        />
      )}
    </div>
  );
}

function Placeholder({ asset, className = "" }: { asset: Asset; className?: string }) {
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden bg-ink-900 ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.028) 0 2px, transparent 2px 16px)",
        }}
      />
      <div className="hairline absolute inset-6 rounded-2xl" />
      <div className="relative px-8 text-center">
        <p className="kicker text-[22px] text-mute">{asset.label}</p>
        <p className="mt-3 font-mono text-[15px] leading-relaxed text-faint">
          {asset.src.replace("/presentation/assets/", "")}
        </p>
        <p className="mt-1 font-mono text-[15px] text-faint">{asset.ratio}</p>
      </div>
    </div>
  );
}
