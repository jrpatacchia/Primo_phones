import { from } from "../lib/motion";
import { motion } from "framer-motion";
import { MessageCircle, RefreshCw, Smartphone, Tag } from "lucide-react";
import { FeatureTag } from "../components/FeatureTag";
import { PhoneMockup } from "../components/PhoneMockup";
import { PresentationSlide } from "../components/PresentationSlide";
import { assets } from "../lib/assets";

/**
 * Tela 01 — apresentação do produto.
 * O catálogo real é o protagonista; tudo ao redor é detalhe secundário.
 */
export function Slide01Product({ active, fixed }: { active: boolean; fixed?: boolean }) {
  return (
    <PresentationSlide halo="center" fixed={fixed}>
      <div className="flex h-full flex-col">
        <motion.span
          className="kicker text-[19px] text-faint"
          initial={from({ opacity: 0, y: 10 })}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.7 }}
        >
          Catálogo digital + painel
        </motion.span>

        <motion.h1
          className="headline mt-9 text-[96px] text-chalk"
          initial={from({ opacity: 0, y: 24, filter: "blur(10px)" })}
          animate={
            active
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 24, filter: "blur(10px)" }
          }
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Seu catálogo.
          <br />
          Seus produtos.
          <br />
          <span className="text-mute">Sempre atualizado.</span>
        </motion.h1>

        <motion.p
          className="mt-10 max-w-[820px] text-[30px] leading-[1.45] text-mute"
          initial={from({ opacity: 0, y: 18 })}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          Uma página profissional para sua loja onde seus clientes encontram aparelhos, preços e
          informações antes mesmo de chamar no WhatsApp.
        </motion.p>

        {/* Mockup + detalhes ao redor */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative">
            <FeatureTag
              icon={Smartphone}
              label="Produtos"
              active={active}
              delay={0.75}
              className="left-[-250px] top-[80px]"
            />
            <FeatureTag
              icon={Tag}
              label="Preços"
              active={active}
              delay={0.88}
              className="left-[-238px] top-[360px]"
            />
            <FeatureTag
              icon={MessageCircle}
              label="WhatsApp"
              active={active}
              delay={1.01}
              align="right"
              className="right-[-268px] top-[170px]"
            />
            <FeatureTag
              icon={RefreshCw}
              label="Atualização fácil"
              active={active}
              delay={1.14}
              align="right"
              className="right-[-268px] top-[450px]"
            />

            <motion.div
              initial={from({ opacity: 0, y: 90, scale: 0.96 })}
              animate={
                active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 90, scale: 0.96 }
              }
              transition={{ duration: 1.15, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <PhoneMockup asset={assets.catalogHome} width={430} priority />
            </motion.div>
          </div>
        </div>
      </div>
    </PresentationSlide>
  );
}
