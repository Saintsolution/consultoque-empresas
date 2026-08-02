import {
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

const WEBHOOK_LOGIN =
  import.meta.env
    .VITE_WEBHOOK_COLABORADOR_LOGIN ||
  'https://n8n.saintsolution.com.br/webhook/colaborador-login';

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, '');
}

function formatarCPF(
  valor: string
) {
  const numeros =
    somenteNumeros(valor)
      .slice(0, 11);

  return numeros
    .replace(
      /^(\d{3})(\d)/,
      '$1.$2'
    )
    .replace(
      /^(\d{3})\.(\d{3})(\d)/,
      '$1.$2.$3'
    )
    .replace(
      /\.(\d{3})(\d)/,
      '.$1-$2'
    );
}

type DadosColaborador = {
  cod_colab?: string;
  cod_pai?: string;
  nome_colab?: string;
  cpf_colab?: string;
  email_colab?: string;
  tel_colab?: string;
  pix_colab?: string;
  status_colab?: string;
  link_indicacao?: string;
};

type RespostaLogin = {
  sucesso?: boolean;
  autenticado?: boolean;
  mensagem?: string;
  token?: string;
  colaborador?: DadosColaborador;
};

export default function Colaborador() {
  const navigate =
    useNavigate();

  const [cpf, setCpf] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    enviando,
    setEnviando,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  const [
    erro,
    setErro,
  ] = useState('');

  async function entrar(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErro('');
    setMensagem('');

    const cpfLimpo =
      somenteNumeros(cpf);

    if (cpfLimpo.length !== 11) {
      setErro(
        'Informe um CPF válido.'
      );

      return;
    }

    if (!senha.trim()) {
      setErro(
        'Informe sua senha.'
      );

      return;
    }

    try {
      setEnviando(true);

      const requisicao =
        await fetch(
          WEBHOOK_LOGIN,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              origem:
                'site_consultoque_empresas',

              finalidade:
                'LOGIN_COLABORADOR',

              tipo_usuario:
                'COLABORADOR',

              cpf_colab:
                cpfLimpo,

              senha,

              enviado_em:
                new Date()
                  .toISOString(),
            }),
          }
        );

      /*
       * Primeiro lemos como texto.
       * Isso evita erro caso o n8n
       * responda sem JSON.
       */
      const textoResposta =
        await requisicao.text();

      let resposta:
        RespostaLogin = {};

      if (textoResposta) {
        try {
          resposta =
            JSON.parse(
              textoResposta
            ) as RespostaLogin;
        } catch {
          throw new Error(
            'O servidor retornou uma resposta inválida.'
          );
        }
      }

      /*
       * Resposta negativa do n8n,
       * como o status HTTP 401.
       */
      if (!requisicao.ok) {
        throw new Error(
          resposta.mensagem ||
          'CPF ou senha inválidos.'
        );
      }

      /*
       * Para autorizar, os dois valores
       * precisam vir como true.
       */
      const autenticado =
        resposta.sucesso === true &&
        resposta.autenticado === true;

      if (!autenticado) {
        throw new Error(
          resposta.mensagem ||
          'CPF ou senha inválidos.'
        );
      }

      if (!resposta.colaborador) {
        throw new Error(
          'Os dados do colaborador não foram retornados.'
        );
      }

      /*
       * Limpa qualquer sessão anterior
       * antes de criar a nova.
       */
      sessionStorage.removeItem(
        'colaborador'
      );

      sessionStorage.removeItem(
        'colaborador_dados'
      );

      sessionStorage.removeItem(
        'colaborador_token'
      );

      /*
       * Esta é a chave principal que
       * o ColaboradorDashboard utilizará.
       */
      sessionStorage.setItem(
        'colaborador',
        JSON.stringify(
          resposta.colaborador
        )
      );

      /*
       * Mantemos temporariamente esta
       * segunda chave por compatibilidade.
       * Depois poderá ser removida.
       */
      sessionStorage.setItem(
        'colaborador_dados',
        JSON.stringify(
          resposta.colaborador
        )
      );

      if (resposta.token) {
        sessionStorage.setItem(
          'colaborador_token',
          resposta.token
        );
      }

      setMensagem(
        resposta.mensagem ||
        'Login realizado com sucesso.'
      );

      navigate(
        '/colaborador/dashboard',
        {
          replace: true,
        }
      );
    } catch (erroRecebido) {
      sessionStorage.removeItem(
        'colaborador'
      );

      sessionStorage.removeItem(
        'colaborador_dados'
      );

      sessionStorage.removeItem(
        'colaborador_token'
      );

      setErro(
        erroRecebido instanceof Error
          ? erroRecebido.message
          : 'Não foi possível realizar o acesso.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16 md:py-24">
      <div className="container-app">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl md:p-9">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <UserRound className="h-7 w-7" />
            </span>

            <h1 className="mt-5 font-display text-3xl font-black text-slate-900">
              Área do colaborador
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Entre para acompanhar suas
              indicações, comissões e seu
              link exclusivo.
            </p>
          </div>

          <form
            onSubmit={entrar}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="cpf-colaborador"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                CPF
              </label>

              <input
                id="cpf-colaborador"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                maxLength={14}
                value={cpf}
                onChange={(evento) =>
                  setCpf(
                    formatarCPF(
                      evento.target.value
                    )
                  )
                }
                placeholder="000.000.000-00"
                className="h-14 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="senha-colaborador"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="senha-colaborador"
                  type={
                    mostrarSenha
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="current-password"
                  value={senha}
                  onChange={(evento) =>
                    setSenha(
                      evento.target.value
                    )
                  }
                  placeholder="Digite sua senha"
                  className="h-14 w-full rounded-xl border border-slate-300 pl-12 pr-12 text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha(
                      (valor) => !valor
                    )
                  }
                  aria-label={
                    mostrarSenha
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {erro}
              </div>
            )}

            {mensagem && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
              >
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 font-bold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm">
            <Link
              to="/criar-senha?tipo=COLABORADOR"
              className="font-semibold text-green-700 hover:text-green-800"
            >
              Esqueci ou quero alterar minha senha
            </Link>

            <Link
              to="/seja-colaborador"
              className="text-slate-600 hover:text-slate-900"
            >
              Ainda não sou colaborador
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}