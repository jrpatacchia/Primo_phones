import { from } from "../lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Pencil } from "lucide-react";
import { assets } from "../lib/assets";
import { useSequence } from "../lib/useSequence";
import { AnimatedConnection } from "./AnimatedConnection";
import { DesktopMockup } from "./DesktopMockup";
import { PhoneMockup } from "./PhoneMockup";

const PRODUCT = "iPhone 17 Pro Max";
const PRICE_BEFORE = "R$ 7.999";
const PRICE_AFTER = "R$ 7.699";

/** Duração de cada etapa: edita → salva → transmite → atualiza → respira. */
const TIMELINE = [1100, 1200, 900, 1400, 900];

/**
 * Demonstração automática: o preço é alterado no painel e o catálogo público
 * acompanha. Os cartões abaixo são anotações sobre as capturas reais — não
 * substituem a interface.
 */
export function CMSDemo({ active }: { active: boolean }) {
  const step = useSequence(TIMELINE, active, 4);

  const editing = step >= 1;
  const saving = step === 2;
  const saved = step >= 3;
  const transmitting = step === 3;
  const updated = step >= 4;

  return (
    <div className="relative flex flex-col items-center">
      {/* Painel administrativo */}
      <div className="relative">
        {/* O mesmo painel no celular — captura real da loja */}
        <motion.div
          className="absolute left-[-92px] top-[86px] z-10"
          initial={from({ opacity: 0, x: -30, rotate: -10 })}
          animate={active ? { opacity: 1, x: 0, rotate: -7 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhoneMockup asset={assets.cmsMobile} width={168} glow={false} />
        </motion.div>

        <DesktopMockup
        asset={assets.cmsDesktop}
        width={720}
        url="emporiophone.com.br/cms/produtos"
        overlay={
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="glass flex items-center gap-4 rounded-2xl px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                <Pencil size={17} strokeWidth={1.7} className="text-chalk/80" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[19px] font-semibold tracking-tight text-chalk">
                  {PRODUCT}
                </p>
                <p className="text-[14px] tracking-wide text-faint">Preço</p>
              </div>

              <PriceSwap
                value={editing ? PRICE_AFTER : PRICE_BEFORE}
                highlight={editing && !saved}
                size={26}
              />

              <div className="w-[112px] shrink-0 text-right">
                <AnimatePresence mode="wait" initial={false}>
                  {saving && (
                    <motion.span
                      key="saving"
                      className="inline-flex items-center gap-2 text-[15px] text-mute"
                      initial={from({ opacity: 0 })}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 size={15} className="animate-spin" /> salvando
                    </motion.span>
                  )}
                  {saved && (
                    <motion.span
                      key="saved"
                      className="inline-flex items-center gap-2 text-[15px] text-wa"
                      initial={from({ opacity: 0, y: 4 })}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Check size={15} strokeWidth={2.4} /> salvo
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        }
        />
      </div>

      {/* Sincronização */}
      <div className="relative flex h-[190px] items-center justify-center">
        <AnimatedConnection height={190} pulse={transmitting} />
        <motion.span
          className="kicker absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-6 text-[15px] whitespace-nowrap"
          animate={{
            color: transmitting ? "var(--color-accent)" : "var(--color-faint)",
            opacity: transmitting ? 1 : 0.6,
          }}
          transition={{ duration: 0.4 }}
        >
          atualizando
        </motion.span>
      </div>

      {/* Catálogo público */}
      <PhoneMockup
        asset={assets.catalogHome}
        width={300}
        crop={{ zoom: 1.02, y: 78 }}
        glow={false}
        overlay={
          <div className="absolute inset-x-0 bottom-0 p-4">
            <motion.div
              className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
              animate={{
                boxShadow: updated
                  ? "inset 0 0 0 1px rgba(156,196,255,0.55), 0 20px 44px -18px rgba(0,0,0,0.9)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.075), 0 20px 44px -18px rgba(0,0,0,0.9)",
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium tracking-tight text-chalk/90">
                  {PRODUCT}
                </p>
                <PriceSwap value={updated ? PRICE_AFTER : PRICE_BEFORE} size={20} />
              </div>
              <AnimatePresence>
                {updated && (
                  <motion.span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-wa/15"
                    initial={from({ scale: 0.4, opacity: 0 })}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <Check size={15} strokeWidth={2.6} className="text-wa" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        }
      />
    </div>
  );
}

/** Troca o preço com um corte vertical curto — sem chamar atenção demais. */
function PriceSwap({
  value,
  size,
  highlight = false,
}: {
  value: string;
  size: number;
  highlight?: boolean;
}) {
  return (
    <span className="relative block overflow-hidden" style={{ height: size * 1.35 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          className="block font-semibold tabular-nums tracking-tight"
          style={{
            fontSize: size,
            lineHeight: 1.35,
            color: highlight ? "var(--color-accent)" : "var(--color-chalk)",
          }}
          initial={from({ y: size * 0.9, opacity: 0 })}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -size * 0.9, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
