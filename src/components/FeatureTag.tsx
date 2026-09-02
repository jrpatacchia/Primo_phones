import { from } from "../lib/motion";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * Detalhe visual secundário ao redor do mockup. Propositalmente pequeno:
 * não deve virar um card nem competir com a interface.
 */
export function FeatureTag({
  icon: Icon,
  label,
  delay = 0,
  active,
  className = "",
  align = "left",
}: {
  icon: LucideIcon;
  label: string;
  delay?: number;
  active: boolean;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <motion.div
      className={`absolute flex items-center gap-3 ${
        align === "right" ? "flex-row-reverse" : ""
      } ${className}`}
      initial={from({ opacity: 0, y: 14, filter: "blur(6px)" })}
      animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="glass grid h-[54px] w-[54px] place-items-center rounded-full">
        <Icon size={22} strokeWidth={1.6} className="text-chalk/85" />
      </span>
      <span className="text-[23px] font-medium tracking-tight text-mute">{label}</span>
    </motion.div>
  );
}
