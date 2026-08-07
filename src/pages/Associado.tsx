import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const ASSOCIADO_LOGIN_URL =
  'https://n8n.saintsolution.com.br/webhook/associado-login';

type LoginResponse = {
  sucesso?: boolean;

  autenticado?: boolean;

  // Compatibilidade com a grafia antiga do n8n
  autoenticado?: boolean;

  precisa_criar_senha?: boolean;
  codigo?: string;
  mensagem?: string;

  token_sessao?: string;
  token_expira?: string;

  destino?: string;
  tipo_usuario?: string;

  cpf_assoc?: string;
  nome_assoc?: string;

  // Compatibilidade com o campo antigo que apareceu no JSON
  'nome _assoc'?: string;

  email_assoc?: string;
};

const CODIGOS_DE_LINK_ENVIADO = new Set([
  'CRIAR_SENHA_ENVIADO',
  'LINK_CRIAR_SENHA_ENVIADO',
  'LINK_CRIAR_SENHA_JA_ENVIADO',
]);

function formatarCpf(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Associado() {
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      setError('Informe um CPF válido com 11 números.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(ASSOCIADO_LOGIN_URL, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          cpf_assoc: cpfLimpo,
          senha: password,
        }),
      });

      let payload: LoginResponse | LoginResponse[];

      try {
        payload = await response.json();
      } catch {
        throw new Error(
          'O serviço retornou uma resposta inválida.'
        );
      }

      const data = Array.isArray(payload)
        ? payload[0] ?? {}
        : payload;

      if (!response.ok) {
        throw new Error(
          data.mensagem ||
            'Não foi possível acessar o serviço de autenticação.'
        );
      }

      /*
       * PRIMEIRO ACESSO
       *
       * O associado ainda não possui senha.
       * O n8n cria o token e envia o e-mail.
       */
      const linkFoiEnviado =
        data.precisa_criar_senha === true ||
        CODIGOS_DE_LINK_ENVIADO.has(
          data.codigo ?? ''
        );

      if (linkFoiEnviado) {
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
       * Aceitamos temporariamente:
       * autenticado
       * autoenticado
       */
      const autenticado =
        data.autenticado ??
        data.autoenticado ??
        false;

      if (
        data.sucesso === true &&
        autenticado === true
      ) {
        if (!data.token_sessao) {
          throw new Error(
            'O login foi autorizado, mas a sessão não foi criada.'
          );
        }

        const sessao = {
          token_sessao:
            data.token_sessao,

          token_expira:
            data.token_expira,

          tipo_usuario:
            data.tipo_usuario ??
            'associado',

          cpf_assoc:
            data.cpf_assoc ??
            cpfLimpo,

          nome_assoc:
            data.nome_assoc ??
            data['nome _assoc'],

          email_assoc:
            data.email_assoc,
        };

        sessionStorage.setItem(
          'associado_sessao',
          JSON.stringify(sessao)
        );

        sessionStorage.setItem(
          'associado_token_sessao',
          data.token_sessao
        );

        /*
         * O n8n atualmente devolve:
         * /associado/dashboard
         */
        navigate(
          data.destino ||
            '/associado/dashboard'
        );

        return;
      }

      setError(
        data.mensagem ||
          'Não foi possível realizar o acesso. Verifique seu CPF e sua senha.'
      );
    } catch (err) {
      console.error(
        'Erro no login do associado:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao sistema neste momento.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container-app">
        <div className="mx-auto max-w-md">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl md:p-9">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <UserRound className="h-8 w-8" />
              </div>

              <h1 className="mt-6 font-display text-3xl font-extrabold text-slate-950">
                Área do associado
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Entre para acessar suas consultas,
                receitas, atestados e benefícios do
                CONSULTOQUE.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="assocCpf"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  CPF
                </label>

                <input
                  id="assocCpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(
                      formatarCpf(
                        e.target.value
                      )
                    );

                    setError(null);
                    setSuccess(null);
                  }}
                  className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="assocPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Senha
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="assocPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(
                        e.target.value
                      );

                      setError(null);
                      setSuccess(null);
                    }}
                    className="h-14 w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    placeholder="Digite sua senha"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  No primeiro acesso, informe
                  seu CPF. Se ainda não houver
                  uma senha, enviaremos o link
                  de criação para seu e-mail.
                </p>
              </div>

              {success && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {success}
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {error}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-base font-semibold text-white shadow-lg shadow-green-600/20 transition enabled:hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition hover:text-green-900"
                onClick={() => {
                  setSuccess(null);

                  setError(
                    'A recuperação de senha será ligada ao fluxo de redefinição na próxima etapa.'
                  );
                }}
              >
                <KeyRound className="h-4 w-4" />
                Esqueci ou quero alterar minha senha
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso protegido — SIA
                Consultoque
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}