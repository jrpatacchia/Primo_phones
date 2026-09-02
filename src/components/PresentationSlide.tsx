import type { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { Stage } from "./Stage";

/**
 * Casca de uma tela. Cada tela funciona como uma arte independente de 1080×1920.
 */
export function PresentationSlide({
  children,
  halo = "top",
  haloIntensity = 1,
  fixed = false,
  id,
}: {
  children: ReactNode;
  halo?: "top" | "center" | "bottom" | "none";
  haloIntensity?: number;
  fixed?: boolean;
  id?: string;
}) {
  return (
    <Stage fixed={fixed}>
      <div id={id} className="relative h-full w-full">
        <Backdrop halo={halo} intensity={haloIntensity} />
        <div className="relative h-full w-full px-[84px] py-[104px]">{children}</div>
      </div>
    </Stage>
  );
}

/** Bloco de título das telas 02 a 05. */
export function SlideHeading({
  kicker,
  title,
  subtitle,
  active,
  align = "left",
  size = 78,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  active: boolean;
  align?: "left" | "center";
  size?: number;
}) {
  const base = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${base}`}>
      {kicker && (
        <span
          className="kicker mb-8 text-[19px] text-faint transition-all duration-700"
          style={{ opacity: active ? 1 : 0, transform: `translateY(${active ? 0 : 10}px)` }}
        >
          {kicker}
        </span>
      )}

      <h2
        className="headline text-chalk transition-all duration-[900ms]"
        style={{
          fontSize: size,
          opacity: active ? 1 : 0,
          transform: `translateY(${active ? 0 : 18}px)`,
          transitionDelay: "80ms",
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-8 max-w-[760px] text-[29px] leading-[1.45] text-mute transition-all duration-[900ms]"
          style={{
            opacity: active ? 1 : 0,
            transform: `translateY(${active ? 0 : 16}px)`,
            transitionDelay: "200ms",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
