import { SLIDE_COUNT, formatCounter } from "../lib/presentation";

/** Contador 01 / 05 + trilha de progresso. */
export function ProgressIndicator({
  index,
  onSelect,
}: {
  index: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[13px] tabular-nums tracking-widest text-faint">
        {formatCounter(index)}
      </span>
      <div className="flex items-center gap-[6px]">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para a tela ${i + 1}`}
            aria-current={i === index}
            onClick={() => onSelect?.(i)}
            className="group py-2"
          >
            <span
              className="block h-[3px] rounded-full transition-all duration-500"
              style={{
                width: i === index ? 28 : 12,
                background: i === index ? "var(--color-accent)" : "rgba(255,255,255,0.22)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
