import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export default function Associado() {
  const [cpf, setCpf] = useState('');
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
      'A autenticação do associado será conectada ao seu fluxo n8n em breve.'
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-gradient text-white shadow-glow">
            <User className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ocean-900">
            Área do Associado
          </h1>
          <p className="mt-2 text-sm text-ocean-600">
            Acesse suas consultas, receitas digitais, atestados e benefícios do
            CONSULTOQUE.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-field" htmlFor="assocCpf">
                CPF
              </label>
              <input
                id="assocCpf"
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) =>
                  setCpf(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11)
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                  )
                }
                className="input-field"
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <label className="label-field" htmlFor="assocPassword">
                Senha
              </label>
              <input
                id="assocPassword"
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-mint-gradient px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all enabled:hover:scale-[1.02] disabled:opacity-50"
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

          <div className="mt-5 space-y-2">
            <p className="flex items-center gap-1.5 text-xs text-ocean-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acesso protegido — SIA Consultoque
            </p>
            <p className="flex items-center gap-1.5 text-xs text-ocean-400">
              <KeyRound className="h-3.5 w-3.5" />
              Esqueceu sua senha? Entre em contato com o administrador da empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
