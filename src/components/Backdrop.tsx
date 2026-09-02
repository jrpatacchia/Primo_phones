/**
 * Fundo compartilhado das telas: preto profundo, um halo muito sutil e grão.
 * Nada aqui deve competir com o produto.
 */
export function Backdrop({
  halo = "top",
  intensity = 1,
}: {
  halo?: "top" | "center" | "bottom" | "none";
  intensity?: number;
}) {
  const y = halo === "top" ? "8%" : halo === "center" ? "44%" : "92%";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-ink-950" />

      {halo !== "none" && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            top: y,
            width: 1500,
            height: 1100,
            opacity: 0.5 * intensity,
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(156,196,255,0.16) 0%, rgba(156,196,255,0.05) 38%, rgba(0,0,0,0) 72%)",
          }}
        />
      )}

      {/* Vinheta — segura o olhar no centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Grade técnica quase imperceptível */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage: "radial-gradient(110% 60% at 50% 40%, #000 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(110% 60% at 50% 40%, #000 20%, transparent 80%)",
        }}
      />

      <div className="grain absolute inset-0 opacity-[0.045] mix-blend-overlay" />
    </div>
  );
}
