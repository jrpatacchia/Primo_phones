import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { STILL, from } from "../lib/motion";

/** Largura do ícone. A trilha corre pelo centro dele. */
const NODE = 92;

/** Um pulso atravessa a trilha inteira neste tempo. */
const PULSE = { travel: 0.95, gap: 0.72, cycle: 4.4 };

/** Uma etapa do caminho até o WhatsApp. */
export function FlowStep({
  icon: Icon,
  label,
  note,
  index,
  active,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  note?: string;
  index: number;
  active: boolean;
  accent?: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-7"
      initial={from({ opacity: 0, x: -26, filter: "blur(8px)" })}
      animate={active ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -26 }}
      transition={{ duration: 0.65, delay: 0.35 + index * 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        className="glass relative grid shrink-0 place-items-center rounded-[26px] bg-ink-950"
        style={{
          width: NODE,
          height: NODE,
          ...(accent
            ? {
                boxShadow:
                  "inset 0 0 0 1px rgba(37,211,102,0.35), 0 24px 60px -24px rgba(0,0,0,0.9)",
              }
            : null),
        }}
      >
        <Icon
          size={34}
          strokeWidth={1.5}
          style={{ color: accent ? "var(--color-wa)" : "rgba(244,245,247,0.88)" }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[38px] font-semibold leading-none tracking-tight text-chalk">{label}</p>
        {note && <p className="mt-3 text-[24px] leading-snug text-mute">{note}</p>}
      </div>
    </motion.div>
  );
}

/**
 * Trecho de trilha entre duas etapas.
 *
 * Ocupa todo o espaço livre entre um ícone e o próximo (`flex-1`), então a linha
 * encosta nos dois. O pulso de neon entra com atraso crescente, o que faz a luz
 * parecer descer o caminho inteiro de uma ponta à outra.
 */
export function FlowConnector({ index, active }: { index: number; active: boolean }) {
  return (
    <motion.div
      className="relative w-[2px] flex-1 overflow-hidden rounded-full"
      style={{
        marginLeft: NODE / 2 - 1,
        minHeight: 44,
        background: "rgba(255,255,255,0.15)",
      }}
      initial={from({ scaleY: 0, opacity: 0 })}
      animate={active ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
      transition={{ duration: 0.45, delay: 0.5 + index * 0.16, ease: "easeOut" }}
    >
      {!STILL && active && (
        <motion.span
          aria-hidden
          className="absolute left-0 w-full rounded-full"
          style={{
            height: "62%",
            background:
              "linear-gradient(180deg, rgba(156,196,255,0) 0%, rgba(156,196,255,1) 58%, rgba(226,240,255,1) 78%, rgba(156,196,255,0) 100%)",
            boxShadow: "0 0 14px 2px rgba(156,196,255,0.75), 0 0 34px 6px rgba(156,196,255,0.3)",
          }}
          initial={{ top: "-62%", opacity: 0 }}
          animate={{ top: ["-62%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: PULSE.travel,
            times: [0, 0.18, 0.82, 1],
            ease: "linear",
            delay: 1.2 + index * PULSE.gap,
            repeat: Infinity,
            repeatDelay: PULSE.cycle - PULSE.travel,
          }}
        />
      )}
    </motion.div>
  );
}
