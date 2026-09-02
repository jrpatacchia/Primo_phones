import { useEffect, useState } from "react";
import { STILL } from "./motion";

/**
 * Percorre uma sequência de etapas em loop enquanto `active` for true.
 * Usado pela demonstração automática do painel (Tela 03).
 *
 * No modo captura a sequência congela em `stillStep`, para que o screenshot
 * saia sempre igual.
 */
export function useSequence(steps: number[], active: boolean, stillStep = steps.length - 1) {
  const [step, setStep] = useState(STILL ? stillStep : 0);

  useEffect(() => {
    if (STILL) return;

    if (!active) {
      setStep(0);
      return;
    }

    let cancelled = false;
    let timer: number;

    const advance = (i: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const next = (i + 1) % steps.length;
        setStep(next);
        advance(next);
      }, steps[i]);
    };

    setStep(0);
    advance(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, steps]);

  return step;
}
