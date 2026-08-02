import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  Copy,
  LogOut,
} from 'lucide-react';

type ColaboradorLogado = {
  cod_colab: string;
  nome_colab: string;
  email_colab: string;
  link_indicacao: string;
};

export default function ColaboradorDashboard() {
  const navigate =
    useNavigate();

  const [
    colaborador,
    setColaborador,
  ] = useState<ColaboradorLogado | null>(
    null
  );

  const [
    linkCopiado,
    setLinkCopiado,
  ] = useState(false);

  useEffect(() => {
    const sessao =
      sessionStorage.getItem(
        'colaborador'
      );

    if (!sessao) {
      navigate(
        '/colaborador',
        {
          replace: true,
        }
      );

      return;
    }

    try {
      const dados =
        JSON.parse(sessao);

      if (!dados.cod_colab) {
        throw new Error(
          'Sessão inválida.'
        );
      }

      setColaborador(dados);
    } catch {
      sessionStorage.removeItem(
        'colaborador'
      );

      navigate(
        '/colaborador',
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  function sair() {
    sessionStorage.removeItem(
      'colaborador'
    );

    sessionStorage.removeItem(
      'colaborador_dados'
    );

    sessionStorage.removeItem(
      'colaborador_token'
    );

    navigate(
      '/colaborador',
      {
        replace: true,
      }
    );
  }

  async function copiarLink() {
    if (
      !colaborador
        ?.link_indicacao
    ) {
      return;
    }

    await navigator
      .clipboard
      .writeText(
        colaborador.link_indicacao
      );

    setLinkCopiado(true);

    window.setTimeout(
      () => {
        setLinkCopiado(false);
      },
      2000
    );
  }

  if (!colaborador) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Carregando painel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container-app py-8 md:py-12">
        {/* Navegação superior */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-400 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>

          <button
            type="button"
            onClick={sair}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        {/* Apresentação */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">
            Área do colaborador
          </p>

          <h1 className="mt-1 font-display text-3xl font-black text-slate-900">
            Olá,{' '}
            {colaborador.nome_colab}
          </h1>

          <p className="mt-2 text-slate-500">
            Código do colaborador:{' '}
            <strong className="text-slate-800">
              {colaborador.cod_colab}
            </strong>
          </p>
        </div>

        {/* Link e cadastro */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Seu link de indicação
            </p>

            <p className="mt-3 break-all text-lg font-semibold text-cyan-600">
              {colaborador.link_indicacao}
            </p>

            <button
              type="button"
              onClick={copiarLink}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
            >
              <Copy className="h-4 w-4" />

              {linkCopiado
                ? 'Link copiado!'
                : 'Copiar link'}
            </button>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Cadastro
            </p>

            <p className="mt-3 break-all font-semibold text-slate-900">
              {colaborador.email_colab}
            </p>

            <p className="mt-2 text-sm font-semibold text-green-600">
              Colaborador ativo
            </p>
          </article>
        </div>

        {/* Indicadores */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Indicações
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              —
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Comissões previstas
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              R$ —
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Comissões recebidas
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              R$ —
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}