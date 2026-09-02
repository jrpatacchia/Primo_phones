import { from } from "../lib/motion";
import { useState } from "react";
import { motion } from "framer-motion";
import { CTA } from "../components/CTA";
import { DesktopMockup } from "../components/DesktopMockup";
import { PhoneMockup } from "../components/PhoneMockup";
import { PresentationSlide, SlideHeading } from "../components/PresentationSlide";
import { EXTENSIONS, ScreenshotFrame } from "../components/ScreenshotFrame";
import { assets } from "../lib/assets";

/** Tela 05 — fechamento. Sem preço, sem plano: o objetivo é abrir conversa. */
export function Slide05Close({
  active,
  fixed,
  ctaHref,
  demoHref,
}: {
  active: boolean;
  fixed?: boolean;
  ctaHref?: string;
  demoHref?: string;
}) {
  return (
    <PresentationSlide halo="center" fixed={fixed}>
      <div className="flex h-full flex-col items-center">
        <SlideHeading
          kicker="Para a sua loja"
          title={
            <>
              Imagine isso com a
              <br />
              identidade da sua loja.
            </>
          }
          subtitle="Página personalizada + catálogo + painel administrativo."
          active={active}
          align="center"
        />

        {/* Produto completo: catálogo + painel + marca */}
        <div className="relative mt-[56px] flex h-[940px] w-full shrink-0 items-start justify-center">
          <motion.div
            className="absolute left-[-72px] top-[248px]"
            initial={from({ opacity: 0, x: -50, y: 30 })}
            animate={active ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -50, y: 30 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopMockup asset={assets.cmsDesktop} width={430} base={false} />
            <p className="kicker mt-6 text-center text-[16px] text-faint">Painel</p>
          </motion.div>

          <motion.div
            className="absolute right-[-64px] top-[292px]"
            initial={from({ opacity: 0, x: 50, y: 30 })}
            animate={active ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 50, y: 30 }}
            transition={{ duration: 1, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative h-[466px] w-[262px] overflow-hidden rounded-[24px]"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.09), 0 44px 90px -36px rgba(0,0,0,0.95)",
                transform: "rotate(6deg)",
              }}
            >
              <ScreenshotFrame asset={assets.otherBrand} crop={{ y: 8 }} />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(5,5,6,0.9) 0%, rgba(0,0,0,0) 40%)",
                }}
              />
            </div>
            <p className="kicker mt-6 text-center text-[16px] text-faint">Outra loja</p>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={from({ opacity: 0, y: 60, scale: 0.95 })}
            animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 1.05, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandSlot active={active} />
            <PhoneMockup asset={assets.catalogHome} width={400} crop={{ zoom: 1.01, y: 20 }} />
          </motion.div>
        </div>

        <div className="mt-auto flex flex-col items-center">
          <CTA
            label="Veja uma demonstração funcionando"
            note="Personalizado para sua loja."
            href={ctaHref}
            secondary={
              demoHref
                ? { label: "Veja uma demo ainda em construção", href: demoHref, wip: true }
                : undefined
            }
            active={active}
            delay={0.95}
          />
        </div>
      </div>
    </PresentationSlide>
  );
}

/** Espaço reservado para a marca da loja, acima do catálogo. */
function BrandSlot({ active }: { active: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const missing = attempt >= EXTENSIONS.length;

  return (
    <motion.div
      className="mx-auto mb-8 flex w-fit items-center gap-4"
      initial={from({ opacity: 0, y: 14 })}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.8, delay: 0.75 }}
    >
      <span className="hairline grid h-[62px] w-[62px] place-items-center overflow-hidden rounded-2xl bg-white/[0.03]">
        {missing ? (
          <span className="text-[18px] font-medium tracking-tight text-faint">logo</span>
        ) : (
          <img
            key={attempt}
            src={`${assets.brandLogo.src}.${EXTENSIONS[attempt]}`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setAttempt((a) => a + 1)}
            className="h-full w-full object-contain p-2"
          />
        )}
      </span>
      <span className="kicker text-[16px] text-faint">sua marca</span>
    </motion.div>
  );
}
