import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { signIn } from "./api";

/**
 * Porta do estúdio.
 *
 * O usuário é criado no painel do Supabase (Authentication → Add user), não
 * aqui: cadastro aberto numa página pública deixaria qualquer pessoa entrar.
 */
export function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-dvh place-items-center bg-ink-950 px-6 text-chalk">
      <form onSubmit={submit} className="w-full max-w-[340px]">
        <span className="glass mb-6 grid h-11 w-11 place-items-center rounded-xl">
          <LockKeyhole size={18} strokeWidth={1.7} className="text-chalk/80" />
        </span>

        <h1 className="text-[19px] font-semibold tracking-tight">Estúdio</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-faint">
          Entre para trocar as mídias da apresentação.
        </p>

        <label className="mt-7 block">
          <span className="mb-1.5 block text-[12px] text-mute">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-lg bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-chalk
                       outline-none ring-1 ring-white/[0.08] transition focus:ring-white/25"
          />
        </label>

        <label className="mt-3.5 block">
          <span className="mb-1.5 block text-[12px] text-mute">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-lg bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-chalk
                       outline-none ring-1 ring-white/[0.08] transition focus:ring-white/25"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-chalk px-4 py-2.5
                     text-[14px] font-medium text-ink-950 transition hover:bg-white disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy ? "entrando…" : "Entrar"}
        </button>

        {error && <p className="mt-4 text-[12px] leading-relaxed text-red-400">{error}</p>}

        <p className="mt-8 text-[11px] leading-relaxed text-faint">
          Não tem acesso? Crie o usuário no painel do Supabase, em Authentication → Users → Add
          user, marcando <span className="text-mute">Auto Confirm User</span>.
        </p>
      </form>
    </div>
  );
}
