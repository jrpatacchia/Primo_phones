import { from } from "../lib/motion";
import { motion } from "framer-motion";

/**
 * Linha de sincronização entre o painel e o catálogo.
 * Trilha estática discreta + um pulso que percorre a linha quando `pulse` é true.
 */
export function AnimatedConnection({
  height,
  pulse,
  className = "",
}: {
  height: number;
  pulse: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ height, width: 2 }}>
      {/* Trilha */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0.16) 82%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Pulso descendo */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 2,
          height: height * 0.34,
          background:
            "linear-gradient(180deg, rgba(156,196,255,0) 0%, rgba(156,196,255,0.95) 55%, rgba(156,196,255,0) 100%)",
          boxShadow: "0 0 22px 3px rgba(156,196,255,0.45)",
        }}
        initial={from({ top: -height * 0.34, opacity: 0 })}
        animate={
          pulse
            ? { top: [-height * 0.34, height], opacity: [0, 1, 1, 0] }
            : { top: -height * 0.34, opacity: 0 }
        }
        transition={{ duration: 1.1, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
      />
    </div>
  );
}
