import { from } from "../lib/motion";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { Headphones, Instagram, LayoutGrid, MessageCircle, Smartphone } from "lucide-react";
import { FlowConnector, FlowStep } from "../components/FlowStep";
import { PresentationSlide, SlideHeading } from "../components/PresentationSlide";

const STEPS = [
  { icon: Instagram, label: "Instagram", note: "O cliente vê a loja e toca no link." },
  { icon: LayoutGrid, label: "Catálogo", note: "Abre a página com todos os aparelhos." },
  { icon: Smartphone, label: "Produto", note: "Escolhe o modelo, vê preço e capacidade." },
  { icon: MessageCircle, label: "WhatsApp", note: "Toca no botão já decidido.", accent: true },
  { icon: Headphones, label: "Atendimento", note: "Você continua a conversa de onde ele parou." },
];

/** Tela 04 — o caminho até o WhatsApp. */
export function Slide04Journey({ active, fixed }: { active: boolean; fixed?: boolean }) {
  return (
    <PresentationSlide halo="bottom" haloIntensity={0.8} fixed={fixed}>
      <div className="flex h-full flex-col">
        <SlideHeading
          kicker="Como funciona na venda"
          title={
            <>
              Um caminho mais simples
              <br />
              até o WhatsApp.
            </>
          }
          active={active}
          size={72}
        />

        <div className="mt-[76px] flex flex-1 flex-col">
          {STEPS.map((step, i) => (
            <Fragment key={step.label}>
              <FlowStep
                icon={step.icon}
                label={step.label}
                note={step.note}
                index={i}
                active={active}
                accent={step.accent}
              />
              {i < STEPS.length - 1 && <FlowConnector index={i} active={active} />}
            </Fragment>
          ))}
        </div>

        <div className="mt-[88px] space-y-4">
          <motion.p
            className="text-[26px] leading-snug text-mute"
            initial={from({ opacity: 0, y: 12 })}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            Seu cliente visualiza as opções antes de entrar em contato.
          </motion.p>
          <motion.p
            className="text-[26px] leading-snug text-faint"
            initial={from({ opacity: 0, y: 12 })}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: 1.45 }}
          >
            Quando chama no WhatsApp, já sabe qual aparelho despertou interesse.
          </motion.p>
        </div>
      </div>
    </PresentationSlide>
  );
}
