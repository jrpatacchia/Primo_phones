import { ChevronDown, ChevronUp } from "lucide-react";
import { SLIDE_COUNT } from "../lib/presentation";
import { ProgressIndicator } from "./ProgressIndicator";

/** Barra discreta de navegação, sobreposta ao deck. */
export function SlideNavigation({
  index,
  onGo,
}: {
  index: number;
  onGo: (i: number) => void;
}) {
  const first = index === 0;
  const last = index === SLIDE_COUNT - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(18px,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto flex items-center gap-2 rounded-full px-3 py-2">
        <NavButton label="Tela anterior" disabled={first} onClick={() => onGo(index - 1)}>
          <ChevronUp size={17} strokeWidth={1.9} />
        </NavButton>

        <div className="px-2">
          <ProgressIndicator index={index} onSelect={onGo} />
        </div>

        <NavButton label="Próxima tela" disabled={last} onClick={() => onGo(index + 1)}>
          <ChevronDown size={17} strokeWidth={1.9} />
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full text-chalk/70 transition
                 hover:bg-white/[0.07] hover:text-chalk disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}
