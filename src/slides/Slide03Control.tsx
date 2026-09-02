import { from } from "../lib/motion";
import { motion } from "framer-motion";
import { CMSDemo } from "../components/CMSDemo";
import { PresentationSlide, SlideHeading } from "../components/PresentationSlide";

/**
 * Tela 03 — o diferencial: quem manda no catálogo é a loja.
 * A demonstração roda sozinha em loop de ~5,5s.
 */
export function Slide03Control({ active, fixed }: { active: boolean; fixed?: boolean }) {
  return (
    <PresentationSlide halo="top" haloIntensity={0.9} fixed={fixed}>
      <div className="flex h-full flex-col">
        <SlideHeading
          kicker="Painel administrativo"
          title="Você controla seu catálogo."
          subtitle="Adicione aparelhos, altere preços e atualize informações através de um painel simples."
          active={active}
        />

        <motion.div
          className="mt-[64px] flex flex-1 justify-center"
          initial={from({ opacity: 0, y: 60 })}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <CMSDemo active={active} />
        </motion.div>
      </div>
    </PresentationSlide>
  );
}
