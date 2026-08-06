import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

const ASSOCIADO_LOGIN_URL =
  'https://n8n.saintsolution.com.br/webhook/associado-login';

type LoginResponse = {
  sucesso?: boolean;
  autenticado?: boolean;
  precisa_criar_senha?: boolean;
  codigo?: string;
  mensagem?: string;
  token_sessao?: string;
};

export default function Associado() {
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

      const response = await fetch(ASSOCIADO_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpfLimpo,
          senha: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível acessar o serviço de autenticação.');
      }

      const data: LoginResponse = await response.json();

      /*
       * PRIMEIRO ACESSO
       *
       * O associado existe em EMP_VENDAS,
       * mas ainda não possui senha_hash.
       *
       * O n8n criou o token e enviou
       * o link de criação de senha por e-mail.
       */
      if (data.codigo === 'CRIAR_SENHA_ENVIADO') {
        setSuccess(
          data.mensagem ||
            'Enviamos para seu e-mail um link para criar sua senha.'
        );

        setPassword('');
        return;
      }

      /*
       * LOGIN NORMAL
       *
       * Esta parte começará a funcionar quando
       * terminarmos o ramo TRUE do node
       * "Associado Tem Senha?" no n8n.
       */
      if (data.sucesso && data.autenticado) {
        if (data.token_sessao) {
          sessionStorage.setItem(
            'associado_token_sessao',
            data.token_sessao
          );
        }

        navigate('/associado-dashboard');
        return;
      }

      /*
       * CPF inexistente, senha incorreta,
       * dados incompletos etc.
       */
      setError(
        data.mensagem ||
          'Não foi possível realizar o acesso. Verifique seus dados.'
      );
    } catch (err) {
      console.error('Erro no login do associado:', err);

      setError(
        'Não foi possível conectar ao sistema neste momento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
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

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
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
                  Verificando...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <p className="flex items-center gap-1.5 text-xs text-ocean-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acesso protegido — SIA Consultoque
            </p>

            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold text-ocean-600 hover:text-ocean-900"
              onClick={() =>
                setError(
                  'A recuperação de senha será habilitada na próxima etapa.'
                )
              }
            >
              <KeyRound className="h-3.5 w-3.5" />
              Esqueci minha senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}