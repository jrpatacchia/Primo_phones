import { useEffect, useRef, useState, type ReactNode } from "react";
import { STAGE_H, STAGE_W } from "../lib/presentation";

/**
 * Palco de 1080 × 1920.
 *
 * Toda a composição é desenhada nesse sistema de coordenadas fixo e depois
 * apenas escalada para caber na tela. Isso garante que a captura em 1080×1920
 * seja idêntica ao que se vê no celular, no tablet e no desktop — sem esticar.
 */
export function Stage({ children, fixed = false }: { children: ReactNode; fixed?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(fixed ? 1 : 0);

  useEffect(() => {
    if (fixed) return;
    const el = host.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, [fixed]);

  if (fixed) {
    return (
      <div
        className="stage-wrap relative overflow-hidden"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        {children}
      </div>
    );
  }

  return (
    <div ref={host} className="stage-wrap absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
          visibility: scale ? "visible" : "hidden",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
