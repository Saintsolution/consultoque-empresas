import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCog,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Placeholder for auth integration (n8n / Supabase) — to be wired later.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setError(
      'A autenticação do administrador será conectada ao seu fluxo n8n em breve.'
    );
  }

  return (
    <div className="min-h-screen bg-ocean-50 pt-40">
      <div className="container-app py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 hover:text-ocean-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="mx-auto mt-8 max-w-md rounded-3xl border border-ocean-100 bg-white p-8 shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow-blue">
            <UserCog className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ocean-900">
            Área do Administrador
          </h1>
          <p className="mt-2 text-sm text-ocean-600">
            Acesso restrito à gestão de planos, associados e benefícios do
            CONSULTOQUE.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-field" htmlFor="adminEmail">
                E-mail
              </label>
              <input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@consultoque.com"
                required
              />
            </div>
            <div>
              <label className="label-field" htmlFor="adminPassword">
                Senha
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-base font-semibold text-white shadow-glow-blue transition-all enabled:hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-ocean-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acesso protegido — SIA Consultoque
          </p>
        </div>
      </div>
    </div>
  );
}
