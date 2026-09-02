import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { from } from "../lib/motion";

export type SecondaryAction = {
  label: string;
  href: string;
  /** Marca o botão como algo ainda em andamento. */
  wip?: boolean;
};

/** Fechamento. Sem preço, sem plano — o objetivo é abrir conversa. */
export function CTA({
  label,
  note,
  href,
  secondary,
  active,
  delay = 0,
}: {
  label: string;
  note?: string;
  href?: string;
  secondary?: SecondaryAction;
  active: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={from({ opacity: 0, y: 22 })}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={href ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="group relative inline-flex items-center gap-4 rounded-full bg-chalk px-12 py-6
                   text-[30px] font-semibold tracking-tight text-ink-950 transition-transform
                   duration-300 hover:scale-[1.02] active:scale-[0.99]"
        style={{ boxShadow: "0 30px 70px -26px rgba(156,196,255,0.55)" }}
      >
        {label}
        <ArrowUpRight
          size={28}
          strokeWidth={2.2}
          className="transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
        />
      </a>

      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noreferrer"
          className="glass group mt-5 inline-flex items-center gap-4 rounded-full px-10 py-5
                     text-[25px] font-medium tracking-tight text-chalk/80 transition
                     duration-300 hover:text-chalk"
        >
          {secondary.wip && (
            <span
              aria-hidden
              className="h-[9px] w-[9px] shrink-0 rounded-full bg-accent"
              style={{ boxShadow: "0 0 12px 2px rgba(156,196,255,0.6)" }}
            />
          )}
          {secondary.label}
          <ArrowUpRight
            size={23}
            strokeWidth={2}
            className="text-mute transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-chalk"
          />
        </a>
      )}

      {note && <p className="mt-7 text-[24px] tracking-tight text-faint">{note}</p>}
    </motion.div>
  );
}
