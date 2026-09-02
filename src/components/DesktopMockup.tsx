import type { ReactNode } from "react";
import type { Asset } from "../lib/assets";
import { ScreenshotFrame } from "./ScreenshotFrame";

/** Janela de navegador em um notebook. Usada para o painel administrativo. */
export function DesktopMockup({
  asset,
  width,
  url = "emporiophone.com.br",
  base = true,
  overlay,
  className = "",
}: {
  asset: Asset;
  width: number;
  url?: string;
  base?: boolean;
  overlay?: ReactNode;
  className?: string;
}) {
  const screenH = Math.round((width * 10) / 16);
  const barH = Math.round(width * 0.052);

  return (
    <div className={`relative ${className}`} style={{ width }}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: width * 1.5,
          height: screenH * 1.8,
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(156,196,255,0.14) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-[18px]"
        style={{
          boxShadow:
            "0 0 0 2px #23232a, 0 0 0 4px #0a0a0c, 0 70px 140px -50px rgba(0,0,0,0.95)",
          background: "#0a0a0c",
        }}
      >
        {/* Barra do navegador */}
        <div
          className="relative flex items-center gap-3 border-b border-white/[0.07] bg-ink-850 px-5"
          style={{ height: barH }}
        >
          <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
          <div className="mx-auto flex h-[62%] min-w-[46%] items-center justify-center rounded-full bg-white/[0.05] px-6">
            <span className="text-[15px] tracking-wide text-faint">{url}</span>
          </div>
        </div>

        <div style={{ height: screenH }} className="relative">
          <ScreenshotFrame asset={asset} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(112deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)",
            }}
          />
          {overlay}
        </div>
      </div>

      {/* Base do notebook */}
      {base && (
        <div className="relative mx-auto" style={{ width: width * 1.14 }}>
          <div
            className="mx-auto h-[14px] rounded-b-[10px]"
            style={{
              background: "linear-gradient(180deg, #26262c 0%, #101014 60%, #08080a 100%)",
              boxShadow: "0 18px 40px -14px rgba(0,0,0,0.9)",
            }}
          />
          <div className="mx-auto h-[3px] w-[16%] rounded-b-full bg-white/10" />
        </div>
      )}
    </div>
  );
}
