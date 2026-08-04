import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  DollarSign,
  LogOut,
  Megaphone,
  QrCode,
  RefreshCw,
  ShoppingCart,
  Users,
  WalletCards,
} from 'lucide-react';

const WEBHOOK_DASHBOARD =
  import.meta.env
    .VITE_WEBHOOK_COLABORADOR_DASHBOARD
    ?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/colaborador-dashboard';

type ColaboradorLogado = {
  cod_colab: string;
  nome_colab: string;
  email_colab: string;
  link_indicacao: string;
};

type DashboardCards = {
  qtd_vendas: number;
  qtd_vendas_pagas: number;
  qtd_vendas_nao_pagas: number;
  total_vendido: number;
  total_vendido_pago: number;
  qtd_individual: number;
  qtd_familiar: number;
  qtd_comissoes: number;
  total_comissoes: number;
  total_a_receber: number;
  total_recebido: number;
  qtd_equipe: number;
  qtd_equipe_ativa: number;
};

type VendaDashboard = {
  num_contrato: string;
  nome_assoc: string;
  empresa: string;
  qtd_individual: number;
  qtd_familiar: number;
  vl_total: number;
  dia_vencimento:
    | number
    | string;
  status_pagamento: string;
  dt_cadastro: string;
};

type ComissaoDashboard = {
  id_comissao: string;
  num_contrato: string;
  tipo_comissao: string;
  percentual: number;
  vl_base: number;
  vl_comissao: number;
  competencia: string;
  status_comissao: string;
  dt_prevista_pagamento: string;
  dt_pagamento: string;
};

type EquipeDashboard = {
  cod_colab: string;
  nome_colab: string;
  email_colab: string;
  status_colab: string;
  dt_cadastro: string;
};

type DashboardResposta = {
  status: string;
  mensagem: string;

  colaborador: {
    cod_colab: string;
    cod_pai: string;
    nome_colab: string;
    email_colab: string;
    status_colab: string;
  };

  cards: DashboardCards;

  listas: {
    vendas: VendaDashboard[];
    comissoes: ComissaoDashboard[];
    equipe: EquipeDashboard[];
  };

  gerado_em: string;
};

function limparSessao() {
  sessionStorage.removeItem(
    'colaborador'
  );

  sessionStorage.removeItem(
    'colaborador_dados'
  );

  sessionStorage.removeItem(
    'colaborador_token'
  );
}

function formatarMoeda(
  valor: unknown
) {
  const numero =
    Number(valor ?? 0);

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  ).format(
    Number.isFinite(numero)
      ? numero
      : 0
  );
}

function formatarData(
  valor: unknown
) {
  const texto =
    String(valor ?? '')
      .trim();

  if (!texto) {
    return '—';
  }

  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(
      texto
    )
  ) {
    return texto;
  }

  const data =
    new Date(texto);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return texto;
  }

  return new Intl.DateTimeFormat(
    'pt-BR'
  ).format(data);
}

function formatarStatus(
  valor: unknown
) {
  const texto =
    String(valor ?? '')
      .trim()
      .toUpperCase();

  const nomes:
    Record<string, string> = {
      NAO_PAGO:
        'Não pago',

      PAGO:
        'Pago',

      RECEBIDO:
        'Recebido',

      RECEIVED:
        'Recebido',

      PENDENTE:
        'Pendente',

      ATIVO:
        'Ativo',

      INATIVO:
        'Inativo',

      CANCELADO:
        'Cancelado',
    };

  return (
    nomes[texto] ||
    texto.replace(
      /_/g,
      ' '
    ) ||
    '—'
  );
}

function statusPositivo(
  valor: unknown
) {
  const status =
    String(valor ?? '')
      .trim()
      .toUpperCase();

  return [
    'PAGO',
    'PAGA',
    'RECEBIDO',
    'RECEBIDA',
    'RECEIVED',
    'ATIVO',
  ].includes(status);
}

export default function ColaboradorDashboard() {
  const navigate =
    useNavigate();

  const [
    colaborador,
    setColaborador,
  ] =
    useState<ColaboradorLogado | null>(
      null
    );

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResposta | null>(
      null
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    linkCopiado,
    setLinkCopiado,
  ] = useState(false);

  const [
    tentativa,
    setTentativa,
  ] = useState(0);

  /*
   * Recupera a sessão do login.
   */
  useEffect(() => {
    const sessao =
      sessionStorage.getItem(
        'colaborador'
      );

    const token =
      sessionStorage.getItem(
        'colaborador_token'
      );

    if (
      !sessao ||
      !token
    ) {
      limparSessao();

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
        JSON.parse(
          sessao
        ) as ColaboradorLogado;

      if (
        !dados.cod_colab
      ) {
        throw new Error(
          'Sessão inválida.'
        );
      }

      setColaborador(
        dados
      );
    } catch {
      limparSessao();

      navigate(
        '/colaborador',
        {
          replace: true,
        }
      );
    }
  }, [
    navigate,
  ]);

  /*
   * Busca os dados reais
   * do dashboard no n8n.
   */
  useEffect(() => {
    if (!colaborador) {
      return;
    }

    const colaboradorAtual =
      colaborador;

    let cancelado =
      false;

    async function carregarDashboard() {
      const token =
        sessionStorage.getItem(
          'colaborador_token'
        );

      if (!token) {
        limparSessao();

        navigate(
          '/colaborador',
          {
            replace: true,
          }
        );

        return;
      }

      setCarregando(true);
      setErro('');

      try {
        const resposta =
          await fetch(
            WEBHOOK_DASHBOARD,
            {
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',

                'X-Colaborador-Token':
                  token,
              },

              body:
                JSON.stringify({
                  cod_colab:
                    colaboradorAtual
                      .cod_colab,
                }),
            }
          );

        const texto =
          await resposta.text();

        let dados:
          | DashboardResposta
          | DashboardResposta[];

        try {
          dados =
            JSON.parse(
              texto
            );
        } catch {
          throw new Error(
            'O servidor não retornou um JSON válido.'
          );
        }

        const resultado =
          Array.isArray(dados)
            ? dados[0]
            : dados;

        if (
          resposta.status === 401 ||
          resposta.status === 403
        ) {
          limparSessao();

          navigate(
            '/colaborador',
            {
              replace: true,
            }
          );

          return;
        }

        if (
          !resposta.ok ||
          !resultado ||
          resultado.status !==
            'sucesso'
        ) {
          throw new Error(
            resultado
              ?.mensagem ||
            'Não foi possível carregar o dashboard.'
          );
        }

        if (!cancelado) {
          setDashboard(
            resultado
          );
        }
      } catch (
        problema
      ) {
        if (!cancelado) {
          setErro(
            problema instanceof
              Error
              ? problema.message
              : 'Não foi possível carregar o dashboard.'
          );
        }
      } finally {
        if (!cancelado) {
          setCarregando(
            false
          );
        }
      }
    }

    carregarDashboard();

    return () => {
      cancelado =
        true;
    };
  }, [
    colaborador,
    navigate,
    tentativa,
  ]);

  function sair() {
    limparSessao();

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

    try {
      await navigator
        .clipboard
        .writeText(
          colaborador
            .link_indicacao
        );

      setLinkCopiado(
        true
      );

      window.setTimeout(
        () => {
          setLinkCopiado(
            false
          );
        },
        2000
      );
    } catch {
      window.prompt(
        'Copie seu link:',
        colaborador
          .link_indicacao
      );
    }
  }

  if (!colaborador) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-slate-500">
          Carregando painel...
        </p>
      </main>
    );
  }

  const cards =
    dashboard?.cards;

  const vendas =
    dashboard
      ?.listas
      .vendas ||
    [];

  const comissoes =
    dashboard
      ?.listas
      .comissoes ||
    [];

  const equipe =
    dashboard
      ?.listas
      .equipe ||
    [];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container-app py-8 md:py-12">
        {/* Navegação */}
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

        {/* Erro */}
        {erro && (
          <article className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

              <div>
                <h2 className="font-bold text-red-900">
                  Não foi possível carregar o painel
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {erro}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setTentativa(
                      (valor) =>
                        valor + 1
                    );
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </button>
              </div>
            </div>
          </article>
        )}

        {/* Carregamento */}
        {carregando && (
          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-600" />

            <p className="mt-3 font-semibold text-slate-600">
              Buscando vendas e comissões...
            </p>
          </article>
        )}

        {/* Indicadores */}
        {!carregando &&
          !erro &&
          cards && (
            <>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <ShoppingCart className="h-5 w-5" />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Vendas realizadas
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {cards.qtd_vendas}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {cards.qtd_vendas_pagas}{' '}
                    pagas e{' '}
                    {cards.qtd_vendas_nao_pagas}{' '}
                    pendentes
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <WalletCards className="h-5 w-5" />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Comissões previstas
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {formatarMoeda(
                      cards.total_a_receber
                    )}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {cards.qtd_comissoes}{' '}
                    comissão(ões)
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <DollarSign className="h-5 w-5" />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Comissões recebidas
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {formatarMoeda(
                      cards.total_recebido
                    )}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Total gerado:{' '}

                    {formatarMoeda(
                      cards.total_comissoes
                    )}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Users className="h-5 w-5" />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Equipe direta
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {cards.qtd_equipe}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {cards.qtd_equipe_ativa}{' '}
                    ativo(s)
                  </p>
                </article>
              </div>

              {/* Resumo dos planos */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Total vendido
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {formatarMoeda(
                      cards.total_vendido
                    )}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Total pago
                  </p>

                  <p className="mt-1 text-xl font-black text-green-700">
                    {formatarMoeda(
                      cards.total_vendido_pago
                    )}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Planos individuais
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {cards.qtd_individual}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Planos familiares
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {cards.qtd_familiar}
                  </p>
                </article>
              </div>
            </>
          )}

        {/* Material promocional */}
        <article className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white shadow-lg">
          <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Megaphone className="h-6 w-6" />
                </span>

                <p className="text-sm font-bold uppercase tracking-wider text-green-200">
                  Área de divulgação
                </p>
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                Seu material promocional está pronto
              </h2>

              <p className="mt-3 max-w-3xl leading-relaxed text-blue-50">
                Gere seu QR Code, compartilhe vídeos com seu número, copie textos e monte panfletos personalizados.
              </p>
            </div>

            <Link
              to="/material-promocional"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-black text-blue-800 shadow-md transition hover:bg-blue-50"
            >
              Acessar materiais
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </article>

        {/* Link e cadastro */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
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

            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Colaborador ativo
            </p>
          </article>
        </div>

        {/* Vendas */}
        {!carregando &&
          !erro &&
          dashboard && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-blue-700" />

                <h2 className="text-2xl font-black text-slate-900">
                  Minhas vendas
                </h2>
              </div>

              {vendas.length ===
              0 ? (
                <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  Nenhuma venda encontrada.
                </article>
              ) : (
                <div className="grid gap-4">
                  {vendas.map(
                    (venda) => (
                      <article
                        key={
                          venda.num_contrato
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {
                                venda.num_contrato
                              }
                            </p>

                            <h3 className="mt-1 text-lg font-black text-slate-900">
                              {
                                venda.nome_assoc
                              }
                            </h3>

                            <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                              <Building2 className="h-4 w-4" />
                              {venda.empresa ||
                                'Empresa não informada'}
                            </p>
                          </div>

                          <span
                            className={
                              statusPositivo(
                                venda.status_pagamento
                              )
                                ? 'rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700'
                                : 'rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700'
                            }
                          >
                            {formatarStatus(
                              venda.status_pagamento
                            )}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          <div>
                            <p className="text-xs text-slate-400">
                              Valor
                            </p>

                            <p className="font-bold text-slate-900">
                              {formatarMoeda(
                                venda.vl_total
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Individuais
                            </p>

                            <p className="font-bold text-slate-900">
                              {
                                venda.qtd_individual
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Familiares
                            </p>

                            <p className="font-bold text-slate-900">
                              {
                                venda.qtd_familiar
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Vencimento
                            </p>

                            <p className="font-bold text-slate-900">
                              Dia{' '}
                              {
                                venda.dia_vencimento
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Cadastro
                            </p>

                            <p className="font-bold text-slate-900">
                              {formatarData(
                                venda.dt_cadastro
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

        {/* Comissões */}
        {!carregando &&
          !erro &&
          dashboard && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <WalletCards className="h-6 w-6 text-green-700" />

                <h2 className="text-2xl font-black text-slate-900">
                  Minhas comissões
                </h2>
              </div>

              {comissoes.length ===
              0 ? (
                <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  Nenhuma comissão encontrada.
                </article>
              ) : (
                <div className="grid gap-4">
                  {comissoes.map(
                    (comissao) => (
                      <article
                        key={
                          comissao.id_comissao
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {
                                comissao.id_comissao
                              }
                              {' · '}
                              {
                                comissao.num_contrato
                              }
                            </p>

                            <p className="mt-2 text-2xl font-black text-slate-900">
                              {formatarMoeda(
                                comissao.vl_comissao
                              )}
                            </p>
                          </div>

                          <span
                            className={
                              statusPositivo(
                                comissao.status_comissao
                              )
                                ? 'rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700'
                                : 'rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700'
                            }
                          >
                            {formatarStatus(
                              comissao.status_comissao
                            )}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-xs text-slate-400">
                              Tipo
                            </p>

                            <p className="font-bold text-slate-900">
                              {formatarStatus(
                                comissao.tipo_comissao
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Percentual
                            </p>

                            <p className="font-bold text-slate-900">
                              {Math.round(
                                Number(
                                  comissao.percentual
                                ) *
                                  100
                              )}
                              %
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Competência
                            </p>

                            <p className="font-bold text-slate-900">
                              {
                                comissao.competencia
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Pagamento previsto
                            </p>

                            <p className="font-bold text-slate-900">
                              {formatarData(
                                comissao
                                  .dt_prevista_pagamento
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

        {/* Equipe */}
        {!carregando &&
          !erro &&
          dashboard && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-700" />

                <h2 className="text-2xl font-black text-slate-900">
                  Minha equipe direta
                </h2>
              </div>

              {equipe.length ===
              0 ? (
                <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  Você ainda não possui colaboradores diretos.
                </article>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {equipe.map(
                    (membro) => (
                      <article
                        key={
                          membro.cod_colab
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Código{' '}
                              {
                                membro.cod_colab
                              }
                            </p>

                            <h3 className="mt-1 font-black text-slate-900">
                              {
                                membro.nome_colab
                              }
                            </h3>

                            <p className="mt-1 break-all text-sm text-slate-500">
                              {
                                membro.email_colab
                              }
                            </p>
                          </div>

                          <span
                            className={
                              statusPositivo(
                                membro.status_colab
                              )
                                ? 'rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700'
                                : 'rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600'
                            }
                          >
                            {formatarStatus(
                              membro.status_colab
                            )}
                          </span>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}
      </section>
    </main>
  );
}