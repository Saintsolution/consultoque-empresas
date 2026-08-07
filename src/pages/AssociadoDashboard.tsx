import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  LogOut,
  Mail,
  Phone,
  Printer,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react';

const ASSOCIADO_DASHBOARD_URL =
  import.meta.env.VITE_WEBHOOK_ASSOCIADO_DASHBOARD?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/associado-dashboard';

const CHAVE_SESSAO = 'associado_sessao';
const CHAVE_TOKEN = 'associado_token_sessao';

type SessaoAssociado = {
  token_sessao: string;
  token_expira?: string;
  tipo_usuario?: string;
  cpf_assoc?: string;
  nome_assoc?: string;
  email_assoc?: string;
};

type DadosAssociado = {
  nome_assoc?: string;
  cpf_assoc?: string;
  nasc_assoc?: string;
  email_assoc?: string;
  tel_assoc?: string;
  empresa?: string;
  cnpj?: string;
};

type DadosContrato = {
  num_contrato?: string;
  qtd_individual?: number | string;
  qtd_familiar?: number | string;
  vl_individual?: number | string;
  vl_familiar?: number | string;
  vl_total?: number | string;
  dia_vencimento?: number | string;
  status_pagamento?: string;
};

type DadosCobranca = {
  vl_cobranca?: number | string;
  vencimento?: string;
  dt_cliente_pagou?: string;
  url_pagamento?: string;
  status_pagamento?: string;
};

type Titular = {
  cpf_titular?: string;
  nome_titular?: string;
  nasc_titular?: string;
  email_titular?: string;
  tel_titular?: string;
  cod_plano?: string | number;
  tipo_plano?: string;
  status_titular?: string;
};

type DashboardResponse = {
  sucesso?: boolean;
  autenticado?: boolean;
  tipo_usuario?: string;
  status?: string;
  codigo?: string;
  mensagem?: string;
  associado?: DadosAssociado;
  contrato?: DadosContrato;
  cobranca?: DadosCobranca;
  titulares?: Titular[];
  quantidade_titulares?: number | string;
  gerado_em?: string;

  // Compatibilidade com respostas anteriores.
  venda?: DadosAssociado;
  dados_associado?: DadosAssociado;
  beneficiarios?: Titular[];
};

function texto(valor: unknown) {
  return String(valor ?? '').trim();
}

function numero(valor: unknown) {
  if (typeof valor === 'number') return valor;

  const normalizado = texto(valor)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : 0;
}

function formatarCpf(valor?: string) {
  const cpf = texto(valor).replace(/\D/g, '').slice(0, 11);
  if (cpf.length !== 11) return valor || 'Não informado';

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCnpj(valor?: string) {
  const cnpj = texto(valor).replace(/\D/g, '').slice(0, 14);
  if (cnpj.length !== 14) return valor || 'Não informado';

  return cnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
}

function formatarTelefone(valor?: string) {
  const telefone = texto(valor).replace(/\D/g, '');

  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return valor || 'Não informado';
}

function formatarMoeda(valor: unknown) {
  return numero(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(valor?: string) {
  if (!valor) return 'Não informado';

  const somenteData = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (somenteData) {
    return `${somenteData[3]}/${somenteData[2]}/${somenteData[1]}`;
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(data);
}

function formatarDataHora(valor?: string) {
  if (!valor) return 'Não informado';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

function primeiroNome(nome?: string) {
  return texto(nome).split(/\s+/)[0] || 'Associado';
}

function statusPagamentoExibicao(status?: string) {
  const normalizado = texto(status).toUpperCase();

  if (!normalizado) return 'Não informado';
  return normalizado === 'PAGO' ? 'PAGO' : 'NÃO PAGO';
}

function statusPositivo(status?: string) {
  return ['PAGO', 'ATIVO', 'ATIVA'].includes(texto(status).toUpperCase());
}

function nomePlano(titular: Titular) {
  const recebido = texto(titular.tipo_plano).toUpperCase();
  if (recebido) return recebido;

  const codigo = texto(titular.cod_plano);
  if (codigo === '2878') return 'INDIVIDUAL';
  if (codigo === '2880') return 'FAMILIAR';

  return codigo || 'Não informado';
}

function lerSessao(): SessaoAssociado | null {
  try {
    const salva = sessionStorage.getItem(CHAVE_SESSAO);
    const tokenSeparado = sessionStorage.getItem(CHAVE_TOKEN);

    if (!salva && !tokenSeparado) return null;

    const dados = salva ? (JSON.parse(salva) as SessaoAssociado) : null;
    const token = texto(dados?.token_sessao || tokenSeparado);

    if (!token) return null;

    return {
      ...dados,
      token_sessao: token,
    };
  } catch {
    return null;
  }
}

function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_TOKEN);
}

export default function AssociadoDashboard() {
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<SessaoAssociado | null>(() =>
    lerSessao()
  );
  const [resposta, setResposta] = useState<DashboardResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const sair = useCallback(() => {
    limparSessao();
    navigate('/associado', { replace: true });
  }, [navigate]);

  const carregarDashboard = useCallback(async () => {
    const sessaoAtual = lerSessao();

    if (!sessaoAtual?.token_sessao) {
      setSessao(null);
      return;
    }

    setSessao(sessaoAtual);
    setCarregando(true);
    setAviso(null);

    try {
      const response = await fetch(ASSOCIADO_DASHBOARD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Associado-Token': sessaoAtual.token_sessao,
        },
        body: JSON.stringify({
          cpf_assoc: sessaoAtual.cpf_assoc,
          token_sessao: sessaoAtual.token_sessao,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        limparSessao();
        navigate('/associado', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error('O serviço do painel ainda não respondeu.');
      }

      const json: unknown = await response.json();
      const primeiro = Array.isArray(json) ? json[0] : json;
      const dados =
        primeiro && typeof primeiro === 'object' && 'json' in primeiro
          ? (primeiro as { json: DashboardResponse }).json
          : (primeiro as DashboardResponse);

      if (dados?.sucesso === false || dados?.autenticado === false) {
        throw new Error(dados.mensagem || 'Não foi possível carregar o painel.');
      }

      setResposta(dados || {});
    } catch (erro) {
      console.error('Erro ao carregar dashboard do associado:', erro);
      setAviso(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível atualizar os dados agora.'
      );
    } finally {
      setCarregando(false);
    }
  }, [navigate]);

  useEffect(() => {
    void carregarDashboard();
  }, [carregarDashboard]);

  const associado = useMemo<DadosAssociado>(() => {
    const recebido =
      resposta?.associado || resposta?.venda || resposta?.dados_associado || {};

    return {
      cpf_assoc: sessao?.cpf_assoc,
      nome_assoc: sessao?.nome_assoc,
      email_assoc: sessao?.email_assoc,
      ...recebido,
    };
  }, [resposta, sessao]);

  const contrato = resposta?.contrato || {};
  const cobranca = resposta?.cobranca || {};
  const titulares = resposta?.titulares || resposta?.beneficiarios || [];

  const quantidadeContratada =
    numero(contrato.qtd_individual) + numero(contrato.qtd_familiar);

  const totalPessoas =
    numero(resposta?.quantidade_titulares) ||
    titulares.length ||
    quantidadeContratada;

  const totalAtivos = titulares.filter((titular) =>
    statusPositivo(titular.status_titular)
  ).length;

  const totalInativos = Math.max(titulares.length - totalAtivos, 0);

  const statusPagamento = statusPagamentoExibicao(
    contrato.status_pagamento || cobranca.status_pagamento
  );

  const pagamentoConfirmado = statusPagamento === 'PAGO';
  const valorMensal = cobranca.vl_cobranca || contrato.vl_total;

  const vencimentoExibicao = cobranca.vencimento
    ? formatarData(cobranca.vencimento)
    : contrato.dia_vencimento
    ? `Todo dia ${contrato.dia_vencimento}`
    : 'Não informado';

  const imprimirRelatorio = useCallback(() => {
    if (!resposta) return;

    const tituloAnterior = document.title;
    const contratoArquivo = texto(contrato.num_contrato) || 'Associado';

    document.title = `Relatorio_ConsulToque_${contratoArquivo}`;
    window.print();
    document.title = tituloAnterior;
  }, [contrato.num_contrato, resposta]);

  if (!sessao) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Sessão não encontrada
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Entre novamente para acessar a Área do Associado.
          </p>
          <Link
            to="/associado"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </main>
    );
  }

  if (carregando && !resposta) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 font-semibold text-slate-700">
            Carregando sua área do associado...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        .dashboard-print {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .dashboard-screen {
            display: none !important;
          }

          .dashboard-print {
            display: block !important;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="dashboard-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                SIA ConsulToque
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Olá, {primeiroNome(associado.nome_assoc)}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void carregarDashboard()}
                disabled={carregando}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                type="button"
                onClick={sair}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
          {aviso && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Não foi possível atualizar agora</p>
                <p className="mt-1">{aviso}</p>
              </div>
            </div>
          )}

          <section
            className={`flex items-start gap-4 rounded-3xl border p-5 shadow-sm sm:items-center sm:p-6 ${
              pagamentoConfirmado
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {pagamentoConfirmado ? (
              <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-8 w-8 shrink-0 text-amber-600" />
            )}
            <div>
              <h2 className="text-lg font-extrabold">
                {pagamentoConfirmado
                  ? 'Pagamento confirmado'
                  : 'Pagamento não confirmado'}
              </h2>
              <p className="mt-1 text-sm leading-relaxed opacity-80">
                {pagamentoConfirmado
                  ? 'Seu contrato está pago. Consulte abaixo as pessoas vinculadas e a situação de cada titular.'
                  : 'Seu cadastro existe, mas o pagamento ainda não foi confirmado. Por isso, os titulares podem aparecer como inativos.'}
              </p>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResumoCard
              icone={<CreditCard className="h-5 w-5" />}
              titulo="Pagamento"
              valor={statusPagamento}
              tom={pagamentoConfirmado ? 'positivo' : 'atencao'}
            />
            <ResumoCard
              icone={<WalletCards className="h-5 w-5" />}
              titulo="Valor mensal"
              valor={formatarMoeda(valorMensal)}
            />
            <ResumoCard
              icone={<UsersRound className="h-5 w-5" />}
              titulo="Pessoas no contrato"
              valor={totalPessoas ? String(totalPessoas) : 'Não informado'}
            />
            <ResumoCard
              icone={<CalendarDays className="h-5 w-5" />}
              titulo="Vencimento atual"
              valor={vencimentoExibicao}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Painel
              titulo="Contrato e planos"
              icone={<FileText className="h-5 w-5" />}
            >
              <Linha label="Contrato" valor={contrato.num_contrato} />
              <Linha label="Empresa" valor={associado.empresa} />
              {texto(associado.cnpj) && (
                <Linha label="CNPJ" valor={formatarCnpj(associado.cnpj)} />
              )}
              <Linha
                label="Planos individuais"
                valor={`${numero(contrato.qtd_individual)} × ${formatarMoeda(
                  contrato.vl_individual
                )}`}
              />
              <Linha
                label="Planos familiares"
                valor={`${numero(contrato.qtd_familiar)} × ${formatarMoeda(
                  contrato.vl_familiar
                )}`}
              />
              <Linha
                label="Total mensal"
                valor={formatarMoeda(contrato.vl_total)}
                forte
              />
            </Painel>

            <Painel
              titulo="Cobrança atual"
              icone={<CreditCard className="h-5 w-5" />}
            >
              <Linha
                label="Situação"
                valor={
                  <StatusBadge
                    status={statusPagamento}
                    positivo={pagamentoConfirmado}
                  />
                }
              />
              <Linha
                label="Valor da cobrança"
                valor={formatarMoeda(valorMensal)}
              />
              <Linha
                label="Vencimento"
                valor={cobranca.vencimento ? formatarData(cobranca.vencimento) : undefined}
              />
              <Linha
                label="Pagamento confirmado em"
                valor={
                  cobranca.dt_cliente_pagou
                    ? formatarData(cobranca.dt_cliente_pagou)
                    : 'Ainda não confirmado'
                }
              />
              <Linha
                label="Dia mensal"
                valor={
                  contrato.dia_vencimento
                    ? `Dia ${contrato.dia_vencimento}`
                    : undefined
                }
              />

              {!pagamentoConfirmado && texto(cobranca.url_pagamento) && (
                <a
                  href={cobranca.url_pagamento}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir boleto
                </a>
              )}
            </Painel>

            <Painel titulo="Seus dados" icone={<UserRound className="h-5 w-5" />}>
              <Linha label="Nome" valor={associado.nome_assoc} />
              <Linha label="CPF" valor={formatarCpf(associado.cpf_assoc)} />
              <Linha label="Nascimento" valor={associado.nasc_assoc} />
              <Linha
                label="E-mail"
                valor={associado.email_assoc}
                icone={<Mail className="h-4 w-4" />}
              />
              <Linha
                label="Telefone"
                valor={formatarTelefone(associado.tel_assoc)}
                icone={<Phone className="h-4 w-4" />}
              />
            </Painel>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold">Pessoas vinculadas</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Titulares sob a responsabilidade deste contrato.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                  {titulares.length} no total
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                  {totalAtivos} ativos
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                  {totalInativos} inativos
                </span>
              </div>
            </div>

            {titulares.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Nenhum titular foi encontrado para este contrato.
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                {titulares.map((titular, indice) => {
                  const ativo = statusPositivo(titular.status_titular);

                  return (
                    <article
                      key={`${titular.cpf_titular || 'titular'}-${indice}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                            Plano {nomePlano(titular)}
                          </p>
                          <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                            {titular.nome_titular || 'Nome não informado'}
                          </h3>
                        </div>
                        <StatusBadge
                          status={titular.status_titular || 'Não informado'}
                          positivo={ativo}
                        />
                      </div>

                      <dl className="mt-5 space-y-3 text-sm">
                        <DetalhePessoa
                          label="CPF"
                          valor={formatarCpf(titular.cpf_titular)}
                        />
                        <DetalhePessoa
                          label="Nascimento"
                          valor={titular.nasc_titular || 'Não informado'}
                        />
                        <DetalhePessoa
                          label="E-mail"
                          valor={titular.email_titular || 'Não informado'}
                        />
                        <DetalhePessoa
                          label="Telefone"
                          valor={formatarTelefone(titular.tel_titular)}
                        />
                      </dl>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-5 rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Relatório do contrato</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
                  Gere uma versão organizada com associado, cobrança, planos e
                  titulares. Na janela seguinte, escolha “Salvar como PDF” ou
                  envie diretamente para a impressora.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={imprimirRelatorio}
              disabled={!resposta}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-5 w-5" />
              Salvar relatório em PDF
            </button>
          </section>

          <footer className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Acesso protegido — SIA ConsulToque
          </footer>
        </div>
      </div>

      <section className="dashboard-print bg-white text-slate-950">
        <header className="border-b-4 border-emerald-600 pb-5">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                SIA ConsulToque
              </p>
              <h1 className="mt-2 text-3xl font-black">Relatório do associado</h1>
              <p className="mt-1 text-sm text-slate-600">
                Contrato {contrato.num_contrato || 'Não informado'}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Documento gerado em</p>
              <p className="mt-1 font-bold text-slate-800">
                {formatarDataHora(resposta?.gerado_em || new Date().toISOString())}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-3 print-avoid-break">
          <RelatorioResumo label="Pagamento" valor={statusPagamento} />
          <RelatorioResumo label="Valor mensal" valor={formatarMoeda(valorMensal)} />
          <RelatorioResumo label="Vencimento" valor={vencimentoExibicao} />
        </div>

        <div className="mt-7 grid grid-cols-2 gap-6 print-avoid-break">
          <RelatorioBloco titulo="Associado responsável">
            <RelatorioLinha label="Nome" valor={associado.nome_assoc} />
            <RelatorioLinha label="CPF" valor={formatarCpf(associado.cpf_assoc)} />
            <RelatorioLinha label="Nascimento" valor={associado.nasc_assoc} />
            <RelatorioLinha label="E-mail" valor={associado.email_assoc} />
            <RelatorioLinha
              label="Telefone"
              valor={formatarTelefone(associado.tel_assoc)}
            />
          </RelatorioBloco>

          <RelatorioBloco titulo="Contrato">
            <RelatorioLinha label="Empresa" valor={associado.empresa} />
            <RelatorioLinha
              label="Planos individuais"
              valor={String(numero(contrato.qtd_individual))}
            />
            <RelatorioLinha
              label="Planos familiares"
              valor={String(numero(contrato.qtd_familiar))}
            />
            <RelatorioLinha
              label="Pessoas vinculadas"
              valor={String(totalPessoas)}
            />
            <RelatorioLinha
              label="Dia mensal"
              valor={
                contrato.dia_vencimento
                  ? `Dia ${contrato.dia_vencimento}`
                  : 'Não informado'
              }
            />
          </RelatorioBloco>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-black">Titulares vinculados</h2>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-300 px-3 py-2">Nome</th>
                <th className="border border-slate-300 px-3 py-2">CPF</th>
                <th className="border border-slate-300 px-3 py-2">Plano</th>
                <th className="border border-slate-300 px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {titulares.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-4 text-center text-slate-500"
                  >
                    Nenhum titular encontrado.
                  </td>
                </tr>
              ) : (
                titulares.map((titular, indice) => (
                  <tr
                    key={`pdf-${titular.cpf_titular || 'titular'}-${indice}`}
                    className="print-avoid-break"
                  >
                    <td className="border border-slate-300 px-3 py-2 font-semibold">
                      {titular.nome_titular || 'Não informado'}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {formatarCpf(titular.cpf_titular)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {nomePlano(titular)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-bold">
                      {titular.status_titular || 'Não informado'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-8 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
          Relatório informativo da Área do Associado — SIA ConsulToque
        </footer>
      </section>
    </main>
  );
}

type ResumoCardProps = {
  icone: ReactNode;
  titulo: string;
  valor: string;
  tom?: 'positivo' | 'atencao' | 'neutro';
};

function ResumoCard({
  icone,
  titulo,
  valor,
  tom = 'neutro',
}: ResumoCardProps) {
  const cores = {
    positivo: 'bg-emerald-100 text-emerald-700',
    atencao: 'bg-amber-100 text-amber-700',
    neutro: 'bg-slate-100 text-slate-700',
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${cores[tom]}`}
      >
        {icone}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{valor}</p>
    </article>
  );
}

type PainelProps = {
  titulo: string;
  icone: ReactNode;
  children: ReactNode;
};

function Painel({ titulo, icone, children }: PainelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2 text-emerald-700">
        {icone}
        <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
      </div>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </section>
  );
}

type LinhaProps = {
  label: string;
  valor?: ReactNode;
  icone?: ReactNode;
  forte?: boolean;
};

function Linha({ label, valor, icone, forte }: LinhaProps) {
  const vazio = valor === undefined || valor === null || valor === '';

  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`flex max-w-[65%] items-center gap-1.5 text-right text-sm text-slate-800 ${
          forte ? 'font-extrabold' : 'font-semibold'
        }`}
      >
        {icone}
        {vazio ? 'Não informado' : valor}
      </dd>
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
  positivo: boolean;
};

function StatusBadge({ status, positivo }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
        positivo
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-800'
      }`}
    >
      {status}
    </span>
  );
}

type DetalhePessoaProps = {
  label: string;
  valor: string;
};

function DetalhePessoa({ label, valor }: DetalhePessoaProps) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-semibold text-slate-700">{valor}</dd>
    </div>
  );
}

type RelatorioResumoProps = {
  label: string;
  valor: string;
};

function RelatorioResumo({ label, valor }: RelatorioResumoProps) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-slate-900">{valor}</p>
    </div>
  );
}

type RelatorioBlocoProps = {
  titulo: string;
  children: ReactNode;
};

function RelatorioBloco({ titulo, children }: RelatorioBlocoProps) {
  return (
    <section className="rounded-lg border border-slate-300 p-4">
      <h2 className="mb-3 text-base font-black">{titulo}</h2>
      <dl className="space-y-2 text-xs">{children}</dl>
    </section>
  );
}

type RelatorioLinhaProps = {
  label: string;
  valor?: string;
};

function RelatorioLinha({ label, valor }: RelatorioLinhaProps) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-1 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-bold text-slate-900">
        {texto(valor) || 'Não informado'}
      </dd>
    </div>
  );
}