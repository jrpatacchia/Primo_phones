import type { ReactNode } from "react";
import type { Asset } from "../lib/assets";
import { getMedia } from "../lib/content";
import { ScreenshotFrame } from "./ScreenshotFrame";

/**
 * iPhone 15 Pro Max desenhado em código. A mídia ocupa só a área da tela.
 *
 * As proporções saem das medidas reais do aparelho: 76,7 × 159,9 mm de corpo e
 * 6,9" de tela. Com uma borda uniforme de 3,58% da largura, a tela cai exatamente
 * em 19,5:9 — a mesma proporção de um print de iPhone 15 Pro Max (1290 × 2796).
 */

/** Tudo em fração da largura do aparelho. */
const RATIO = {
  height: 2.0847,
  radius: 0.152,
  /** Borda de titânio ao redor da tela. */
  bezel: 0.0358,
  /** Espessura do trilho lateral que aparece nas bordas. */
  rail: 0.013,
};

const ISLAND = {
  /** Frações da largura da TELA. */
  width: 0.293,
  height: 0.086,
  top: 0.026,
};

/** Botões laterais, em fração da altura do aparelho. */
const BUTTONS = {
  action: { top: 0.152, height: 0.031 },
  volumeUp: { top: 0.212, height: 0.05 },
  volumeDown: { top: 0.276, height: 0.05 },
  power: { top: 0.222, height: 0.078 },
};

export function PhoneMockup({
  asset,
  width,
  crop,
  glow = true,
  reflection = true,
  priority = false,
  overlay,
  className = "",
}: {
  asset: Asset;
  width: number;
  crop?: { zoom?: number; x?: number; y?: number };
  glow?: boolean;
  reflection?: boolean;
  priority?: boolean;
  overlay?: ReactNode;
  className?: string;
}) {
  /* Mídia que já vem com um aparelho desenhado dentro não ganha outro por cima. */
  const prewrapped = getMedia(asset.id)?.prewrapped ?? asset.prewrapped === true;

  return prewrapped ? (
    <BareMedia
      asset={asset}
      width={width}
      crop={crop}
      glow={glow}
      reflection={reflection}
      priority={priority}
      overlay={overlay}
      className={className}
    />
  ) : (
    <Device
      asset={asset}
      width={width}
      crop={crop}
      glow={glow}
      reflection={reflection}
      priority={priority}
      overlay={overlay}
      className={className}
    />
  );
}

type Common = {
  asset: Asset;
  width: number;
  crop?: { zoom?: number; x?: number; y?: number };
  glow: boolean;
  reflection: boolean;
  priority: boolean;
  overlay?: ReactNode;
  className: string;
};

function Device({ asset, width, crop, glow, reflection, priority, overlay, className }: Common) {
  const height = width * RATIO.height;
  const radius = width * RATIO.radius;
  const bezel = width * RATIO.bezel;
  const rail = width * RATIO.rail;

  const screenW = width - bezel * 2;
  const screenRadius = radius - bezel;

  return (
    <div className={`relative ${className}`} style={{ width }}>
      {glow && <Glow width={width} height={height} />}

      <SideButtons height={height} rail={rail} />

      {/* Corpo em titânio */}
      <div
        className="relative"
        style={{
          width,
          height,
          borderRadius: radius,
          background: "linear-gradient(150deg, #57575e 0%, #2a2a2f 26%, #1a1a1e 52%, #3c3c43 78%, #212126 100%)",
          padding: bezel,
          boxShadow: [
            /* Fio de luz na quina superior esquerda e sombra na inferior direita */
            `inset 0 ${width * 0.004}px ${width * 0.006}px rgba(255,255,255,0.42)`,
            `inset ${width * 0.003}px 0 ${width * 0.006}px rgba(255,255,255,0.22)`,
            `inset -${width * 0.003}px 0 ${width * 0.006}px rgba(0,0,0,0.6)`,
            `inset 0 -${width * 0.004}px ${width * 0.008}px rgba(0,0,0,0.7)`,
            `0 ${width * 0.16}px ${width * 0.3}px -${width * 0.1}px rgba(0,0,0,0.95)`,
          ].join(", "),
        }}
      >
        {/* Tela */}
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{
            borderRadius: screenRadius,
            boxShadow: `inset 0 0 0 ${Math.max(1, width * 0.0025)}px rgba(0,0,0,0.9)`,
          }}
        >
          <ScreenshotFrame asset={asset} crop={crop} priority={priority} />

          <DynamicIsland screenW={screenW} />

          {/* Indicador de início */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85"
            style={{
              bottom: screenW * 0.022,
              width: screenW * 0.35,
              height: Math.max(2, screenW * 0.011),
            }}
          />

          {reflection && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(118deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.02) 17%, rgba(255,255,255,0) 40%)",
              }}
            />
          )}

          {overlay}
        </div>
      </div>
    </div>
  );
}

/** Ilha dinâmica — a pílula preta no topo da tela. */
function DynamicIsland({ screenW }: { screenW: number }) {
  const width = screenW * ISLAND.width;
  const height = screenW * ISLAND.height;

  return (
    <div
      aria-hidden
      className="absolute left-1/2 z-10 -translate-x-1/2 bg-black"
      style={{
        top: screenW * ISLAND.top,
        width,
        height,
        borderRadius: height / 2,
        boxShadow: `inset 0 0 ${height * 0.3}px rgba(255,255,255,0.05)`,
      }}
    >
      {/* Câmera frontal */}
      <span
        className="absolute rounded-full"
        style={{
          right: height * 0.32,
          top: "50%",
          transform: "translateY(-50%)",
          width: height * 0.34,
          height: height * 0.34,
          background: "radial-gradient(circle at 35% 30%, #2a3550 0%, #10141f 60%, #05070c 100%)",
          boxShadow: "inset 0 0 2px rgba(120,160,255,0.35)",
        }}
      />
    </div>
  );
}

/** Botão de ação e volume à esquerda, botão lateral à direita. */
function SideButtons({ height, rail }: { height: number; rail: number }) {
  const face = "linear-gradient(90deg, #4a4a51 0%, #2b2b30 55%, #17171a 100%)";
  const faceRight = "linear-gradient(270deg, #4a4a51 0%, #2b2b30 55%, #17171a 100%)";

  const button = (side: "left" | "right", top: number, tall: number) => (
    <span
      aria-hidden
      className="absolute"
      style={{
        [side]: -rail * 0.62,
        top: height * top,
        width: rail,
        height: height * tall,
        borderRadius: rail * 0.5,
        background: side === "left" ? face : faceRight,
        boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
      }}
    />
  );

  return (
    <>
      {button("left", BUTTONS.action.top, BUTTONS.action.height)}
      {button("left", BUTTONS.volumeUp.top, BUTTONS.volumeUp.height)}
      {button("left", BUTTONS.volumeDown.top, BUTTONS.volumeDown.height)}
      {button("right", BUTTONS.power.top, BUTTONS.power.height)}
    </>
  );
}

/** Captura que já traz o aparelho desenhado: só sombra e reflexo. */
function BareMedia({ asset, width, crop, glow, reflection, priority, overlay, className }: Common) {
  const height = Math.round(width * (3034 / 1482));
  const radius = Math.round(width * 0.13);

  return (
    <div className={`relative ${className}`} style={{ width }}>
      {glow && <Glow width={width} height={height} />}

      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          borderRadius: radius,
          background: "#0a0a0c",
          boxShadow: `0 ${width * 0.15}px ${width * 0.3}px -${width * 0.1}px rgba(0,0,0,0.95)`,
        }}
      >
        <ScreenshotFrame asset={asset} crop={crop} priority={priority} />

        {reflection && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 18%, rgba(255,255,255,0) 42%)",
            }}
          />
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ borderRadius: radius, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        />

        {overlay}
      </div>
    </div>
  );
}

function Glow({ width, height }: { width: number; height: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: width * 2.1,
        height: height * 1.1,
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(156,196,255,0.16) 0%, rgba(0,0,0,0) 70%)",
      }}
    />
  );
}
