import { from } from "../lib/motion";
import { motion } from "framer-motion";
import { PhoneMockup } from "../components/PhoneMockup";
import { PresentationSlide, SlideHeading } from "../components/PresentationSlide";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { assets } from "../lib/assets";

const ITEMS = [
  "Produtos disponíveis",
  "Preços",
  "Capacidades",
  "Informações",
  "WhatsApp",
  "Redes sociais",
];

/**
 * Tela 02 — experiência do cliente.
 * Composição em camadas: o catálogo ao centro, dois recortes ao redor.
 */
export function Slide02Experience({ active, fixed }: { active: boolean; fixed?: boolean }) {
  return (
    <PresentationSlide halo="center" haloIntensity={0.85} fixed={fixed}>
      <div className="flex h-full flex-col">
        <SlideHeading
          kicker="Experiência do cliente"
          title={
            <>
              Tudo que seu cliente
              <br />
              precisa em um só lugar.
            </>
          }
          active={active}
        />

        {/* Composição tridimensional */}
        <div
          className="relative mt-[56px] flex flex-1 items-center justify-center"
        >
          {/* Recorte à esquerda — lista de produtos */}
          <motion.div
            className="absolute left-[-58px] top-[96px]"
            initial={from({ opacity: 0, x: -60, rotateY: 26 })}
            animate={active ? { opacity: 1, x: 0, rotateY: 16 } : { opacity: 0, x: -60 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1500 }}
          >
            <Cutout
              width={296}
              height={548}
              tilt={-7}
              caption="Produtos"
              captionAlign="left"
              node={
                <ScreenshotFrame
                  asset={assets.catalogProducts}
                  crop={{ zoom: 1.15, y: 62 }}
                />
              }
            />
          </motion.div>

          {/* Recorte à direita — detalhe e preço */}
          <motion.div
            className="absolute right-[-58px] top-[292px]"
            initial={from({ opacity: 0, x: 60, rotateY: -26 })}
            animate={active ? { opacity: 1, x: 0, rotateY: -16 } : { opacity: 0, x: 60 }}
            transition={{ duration: 1, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1500 }}
          >
            <Cutout
              width={296}
              height={548}
              tilt={7}
              caption="Preços e informações"
              captionAlign="right"
              node={<ScreenshotFrame asset={assets.catalogDetail} crop={{ zoom: 1.15, y: 40 }} />}
            />
          </motion.div>

          {/* Catálogo ao centro */}
          <motion.div
            className="relative z-10"
            initial={from({ opacity: 0, y: 70, scale: 0.95 })}
            animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 70, scale: 0.95 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <PhoneMockup asset={assets.catalogHome} width={430} crop={{ zoom: 1.01, y: 62 }} />
          </motion.div>
        </div>

        {/* Etiquetas do conteúdo */}
        <div className="mt-auto">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-4">
            {ITEMS.map((item, i) => (
              <motion.span
                key={item}
                className="hairline rounded-full px-6 py-3 text-[22px] tracking-tight text-mute"
                initial={from({ opacity: 0, y: 12 })}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.55, delay: 0.95 + i * 0.07 }}
              >
                {item}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="mt-12 text-center text-[23px] leading-snug text-faint"
            initial={from({ opacity: 0 })}
            animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 1.45 }}
          >
            Compartilhe na bio, Stories, anúncios ou diretamente no WhatsApp.
          </motion.p>
        </div>
      </div>
    </PresentationSlide>
  );
}

const CAPTION_ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

/** Recorte lateral do catálogo, com legenda discreta. */
function Cutout({
  width,
  height,
  tilt,
  caption,
  captionAlign = "center",
  node,
}: {
  width: number;
  height: number;
  tilt: number;
  caption: string;
  captionAlign?: "left" | "center" | "right";
  node: React.ReactNode;
}) {
  return (
    <div style={{ width, transform: `rotate(${tilt}deg)` }}>
      <div
        className="relative overflow-hidden rounded-[26px]"
        style={{
          height,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.09), 0 50px 100px -40px rgba(0,0,0,0.95)",
        }}
      >
        {node}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 34%), linear-gradient(0deg, rgba(5,5,6,0.85) 0%, rgba(0,0,0,0) 32%)",
          }}
        />
      </div>
      <p className={`kicker mt-5 text-[16px] text-faint ${CAPTION_ALIGN[captionAlign]}`}>{caption}</p>
    </div>
  );
}
