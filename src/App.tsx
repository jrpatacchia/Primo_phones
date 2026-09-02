import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlideNavigation } from "./components/SlideNavigation";
import { Slide01Product } from "./slides/Slide01Product";
import { Slide02Experience } from "./slides/Slide02Experience";
import { Slide03Control } from "./slides/Slide03Control";
import { Slide04Journey } from "./slides/Slide04Journey";
import { Slide05Close } from "./slides/Slide05Close";
import { isSupabaseConfigured } from "./lib/supabase";
import {
  DEMO_INTERVAL_MS,
  SLIDE_COUNT,
  clampIndex,
  readRoute,
} from "./lib/presentation";

/** Link do CTA. Troque pelo WhatsApp ou pela demonstração ao vivo. */
const CTA_HREF = "https://emporiophone.com.br";

/** Segundo botão do fechamento — a demo que ainda está sendo montada. */
const DEMO_HREF = "https://leomayertattoo.com/primos/";

type SlideProps = { active: boolean; fixed?: boolean };

const SLIDES: Array<(p: SlideProps) => JSX.Element> = [
  (p) => <Slide01Product {...p} />,
  (p) => <Slide02Experience {...p} />,
  (p) => <Slide03Control {...p} />,
  (p) => <Slide04Journey {...p} />,
  (p) => <Slide05Close {...p} ctaHref={CTA_HREF} demoHref={DEMO_HREF} />,
];

/* O estúdio só existe em desenvolvimento; em produção nem entra no bundle principal. */
const Studio = lazy(() => import("./studio/Studio"));

export default function App() {
  const route = useMemo(() => readRoute(), []);

  if (route.mode === "studio") {
    /*
     * Em produção o estúdio só faz sentido com Supabase: sem ele não há onde
     * gravar, porque o servidor que escreve em disco só existe no npm run dev.
     */
    if (!import.meta.env.DEV && !isSupabaseConfigured) return <StudioUnavailable />;
    return (
      <Suspense fallback={<Loading />}>
        <Studio />
      </Suspense>
    );
  }

  if (route.mode === "capture") return <CaptureMode only={route.only} />;
  return <Deck autoplay={route.mode === "demo"} start={route.start} />;
}

function Loading() {
  return <div className="grid h-dvh place-items-center text-[13px] text-faint">carregando…</div>;
}

/** O estúdio grava arquivos no seu computador, então não vai para o ar. */
function StudioUnavailable() {
  return (
    <div className="grid h-dvh place-items-center px-8 text-center">
      <div className="max-w-[420px]">
        <p className="text-[15px] font-semibold tracking-tight text-chalk">
          O estúdio roda só no seu computador.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-faint">
          Abra o projeto, rode <span className="font-mono text-mute">npm run dev</span> e acesse{" "}
          <span className="font-mono text-mute">/studio</span>. A apresentação publicada é estática:
          não existe painel nem servidor nela.
        </p>
        <a href="/" className="mt-6 inline-block text-[13px] text-mute underline underline-offset-4 hover:text-chalk">
          Ir para a apresentação
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Apresentação                                                        */
/* ------------------------------------------------------------------ */

function Deck({ autoplay, start }: { autoplay: boolean; start: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const sections = useRef<Array<HTMLElement | null>>([]);
  const [index, setIndex] = useState(start);

  const goTo = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const target = sections.current[clampIndex(i)];
    target?.scrollIntoView({ behavior, block: "start" });
  }, []);

  /* Tela ativa — derivada da rolagem, que dirige as animações de cada seção. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const sync = () => {
      const height = el.clientHeight || 1;
      setIndex(clampIndex(Math.round(el.scrollTop / height)));
    };

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  /* Posição inicial vinda de ?slide=N. */
  useEffect(() => {
    if (start > 0) goTo(start, "auto");
  }, [start, goTo]);

  /* Teclado. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "Home") {
        goTo(0);
      } else if (e.key === "End") {
        goTo(SLIDE_COUNT - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  /* Modo /demo — avança sozinho e reinicia ao final. */
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = current + 1 >= SLIDE_COUNT ? 0 : current + 1;
        goTo(next, next === 0 ? "auto" : "smooth");
        return next;
      });
    }, DEMO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, goTo]);

  return (
    <>
      <div ref={scroller} className="deck">
        {SLIDES.map((Slide, i) => (
          <section
            key={i}
            data-index={i}
            ref={(el) => {
              sections.current[i] = el;
            }}
            className="deck-section"
          >
            <Slide active={index === i} />
          </section>
        ))}
      </div>

      {!autoplay && <SlideNavigation index={index} onGo={goTo} />}
      {!autoplay && index === 0 && <ScrollHint />}
    </>
  );
}

/** Convite discreto para deslizar — some assim que a pessoa rola. */
function ScrollHint() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[104px] z-20 flex justify-center">
      <span className="kicker animate-pulse text-[11px] text-faint">deslize</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modo captura — /presentation e /presentation?slide=N                */
/* ------------------------------------------------------------------ */

function CaptureMode({ only }: { only: number | null }) {
  const list = only === null ? SLIDES.map((_, i) => i) : [only];

  useEffect(() => {
    document.documentElement.style.background = "#050506";
  }, []);

  return (
    <div className="capture flex w-fit flex-col">
      {list.map((i) => {
        const Slide = SLIDES[i];
        return (
          <div key={i} data-capture-slide={i + 1}>
            <Slide active fixed />
          </div>
        );
      })}
    </div>
  );
}
