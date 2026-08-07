import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  Phone,
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
  num_contrato?: string;
  cod_colab?: string;
  nome_assoc?: string;
  cpf_assoc?: string;
  nasc_assoc?: string;
  email_assoc?: string;
  tel_assoc?: string;
  empresa?: string;
  cnpj?: string;
  qtd_individual?: number | string;
  qtd_familiar?: number | string;
  vl_individual?: number | string;
  vl_familiar?: number | string;
  vl_total?: number | string;
  dia_vencimento?: number | string;
  status_pagamento?: string;
  id_asaas_cliente?: string;
  id_asaas_assinatura?: string;
  dt_cadastro?: string;
  dt_alteracao?: string;
};

type Titular = {
  num_contrato?: string;
  cpf_titular?: string;
  nome_titular?: string;
  nasc_titular?: string;
  email_titular?: string;
  tel_titular?: string;
  cod_plano?: string | number;
  status_titular?: string;
  dt_inclusao?: string;
  dt_exclusao?: string;
  dt_alteracao?: string;
};

type DashboardResponse = {
  sucesso?: boolean;
  status?: string;
  codigo?: string;
  mensagem?: string;
  associado?: DadosAssociado;
  venda?: DadosAssociado;
  dados_associado?: DadosAssociado;
  titulares?: Titular[];
  beneficiarios?: Titular[];
  gerado_em?: string;
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
    timeStyle: 'short',
  }).format(data);
}

function primeiroNome(nome?: string) {
  return texto(nome).split(/\s+/)[0] || 'Associado';
}

function statusPositivo(status?: string) {
  return ['PAGO', 'ATIVO', 'ATIVA', 'ADIMPLENTE'].includes(
    texto(status).toUpperCase()
  );
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

      if (dados?.sucesso === false) {
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

  const titulares = resposta?.titulares || resposta?.beneficiarios || [];
  const totalPessoas =
    numero(associado.qtd_individual) + numero(associado.qtd_familiar) ||
    titulares.length;

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              SIA Consultoque
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
              <p className="font-semibold">Dados básicos carregados</p>
              <p className="mt-1">
                {aviso} Os dados guardados no login continuam disponíveis.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumoCard
            icone={<CreditCard className="h-5 w-5" />}
            titulo="Pagamento"
            valor={associado.status_pagamento || 'Não informado'}
            destaque={statusPositivo(associado.status_pagamento)}
          />
          <ResumoCard
            icone={<WalletCards className="h-5 w-5" />}
            titulo="Valor mensal"
            valor={formatarMoeda(associado.vl_total)}
          />
          <ResumoCard
            icone={<UsersRound className="h-5 w-5" />}
            titulo="Pessoas no plano"
            valor={totalPessoas ? String(totalPessoas) : 'Não informado'}
          />
          <ResumoCard
            icone={<CalendarDays className="h-5 w-5" />}
            titulo="Dia do vencimento"
            valor={
              associado.dia_vencimento
                ? `Todo dia ${associado.dia_vencimento}`
                : 'Não informado'
            }
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Painel titulo="Contrato e plano" icone={<FileText className="h-5 w-5" />}>
            <Linha label="Contrato" valor={associado.num_contrato} />
            <Linha label="Empresa" valor={associado.empresa} />
            <Linha label="CNPJ" valor={formatarCnpj(associado.cnpj)} />
            <Linha
              label="Plano individual"
              valor={`${associado.qtd_individual || 0} × ${formatarMoeda(
                associado.vl_individual
              )}`}
            />
            <Linha
              label="Plano familiar"
              valor={`${associado.qtd_familiar || 0} × ${formatarMoeda(
                associado.vl_familiar
              )}`}
            />
            <Linha label="Cadastro" valor={formatarData(associado.dt_cadastro)} />
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
            <Linha
              label="Última atualização"
              valor={formatarData(associado.dt_alteracao)}
            />
          </Painel>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold">Titulares e beneficiários</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Pessoas vinculadas ao seu contrato.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {titulares.length}
            </span>
          </div>

          {titulares.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              {carregando
                ? 'Carregando beneficiários...'
                : 'Nenhum titular foi retornado pelo painel ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">CPF</th>
                    <th className="px-6 py-3">Plano</th>
                    <th className="px-6 py-3">Contato</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {titulares.map((titular, indice) => (
                    <tr key={`${titular.cpf_titular || 'titular'}-${indice}`}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {titular.nome_titular || 'Nome não informado'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Nasc.: {titular.nasc_titular || 'Não informado'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatarCpf(titular.cpf_titular)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {titular.cod_plano || 'Não informado'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p>{titular.email_titular || 'E-mail não informado'}</p>
                        <p className="mt-1 text-xs">
                          {formatarTelefone(titular.tel_titular)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            statusPositivo(titular.status_titular)
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {titular.status_titular || 'Não informado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          Acesso protegido — SIA Consultoque
        </footer>
      </div>
    </main>
  );
}

type ResumoCardProps = {
  icone: ReactNode;
  titulo: string;
  valor: string;
  destaque?: boolean;
};

function ResumoCard({ icone, titulo, valor, destaque }: ResumoCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          destaque
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-700'
        }`}
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
  valor?: string | number;
  icone?: ReactNode;
};

function Linha({ label, valor, icone }: LinhaProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="flex max-w-[65%] items-center gap-1.5 text-right text-sm font-semibold text-slate-800">
        {icone}
        {texto(valor) || 'Não informado'}
      </dd>
    </div>
  );
}