import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Heart,
  Calculator,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Info,
  AlertCircle,
  Pencil,
  FileText,
  X,
} from 'lucide-react';
import {
  type HolderEntry,
  type PlanType,
  calculatePrice,
  formatCPF,
  formatCNPJ,
  formatPhone,
  onlyDigits,
  isValidCNPJ,
  isValidEmail,
  BULK_THRESHOLD,
} from '@/lib/pricing';

/*
 * Endpoint publicado do fluxo coletivo empresarial no n8n.
 */
const WEBHOOK_URL =
  'https://n8n.saintsolution.com.br/webhook/coletivo-empresarial';

const CHAVE_INDICADOR = 'indicador_colab';
const COOKIE_INDICADOR = 'indicador_colab';

/*
 * Liberação temporária para os testes do fluxo completo.
 * Amanhã, ao religar o validador, estes dois indicadores devem voltar
 * a refletir o resultado real da consulta de CPF e maioridade.
 */
const CPF_VALIDATION_TEMPORARILY_DISABLED = true;

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function getCodColab(): string {
  const local = localStorage.getItem(CHAVE_INDICADOR);
  const cookie = getCookie(COOKIE_INDICADOR);
  const codigo = String(local || cookie || '').trim();

  return /^\d{4}$/.test(codigo) ? codigo : '0001';
}

function formatBirthDateBR(date: string): string {
  if (!date) return '';

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }

  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match
    ? `${match[3]}/${match[2]}/${match[1]}`
    : date;
}

interface HolderField {
  id: string;
  plan: PlanType;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface PaymentResponse {
  status: string;
  message: string;
  url_pagamento: string;
  dt_vencimento: string;
  dia_vencimento: string;
  email: string;
}

function newHolder(): HolderField {
  return {
    id: crypto.randomUUID(),
    plan: 'individual',
    name: '',
    cpf: '',
    email: '',
    phone: '',
    birthDate: '',
  };
}

function toHolderEntry(h: HolderField): HolderEntry {
  return { id: h.id, plan: h.plan, name: h.name, cpf: onlyDigits(h.cpf) };
}

function planLabel(plan: PlanType): string {
  return plan === 'individual' ? 'Individual' : 'Familiar';
}

function maskCPF(cpf: string): string {
  const digits = onlyDigits(cpf);

  return digits.length === 11
    ? `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
    : cpf;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function FormColetivo() {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [responsibleBirthDate, setResponsibleBirthDate] = useState('');
  const [responsibleEmail, setResponsibleEmail] = useState('');
  const [responsiblePhone, setResponsiblePhone] = useState('');
  const [responsibleSaved, setResponsibleSaved] = useState(false);
  const [responsibleFormError, setResponsibleFormError] =
    useState<string | null>(null);
  const [holders, setHolders] = useState<HolderField[]>([]);
  const [holderDraft, setHolderDraft] = useState<HolderField | null>(null);
  const [holderFormError, setHolderFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] =
    useState<PaymentResponse | null>(null);

  const breakdown = useMemo(
    () => calculatePrice(holders.map(toHolderEntry)),
    [holders]
  );

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!responsibleSaved) errors.push('Salve os dados do responsável.');
    if (holderDraft) errors.push('Salve ou cancele o titular que está aberto.');
    if (holders.length === 0) errors.push('Adicione pelo menos 1 titular.');

    const holderCpfs = holders.map((holder) => onlyDigits(holder.cpf));
    const repeatedCpfs = holderCpfs.filter(
      (cpf, index) => cpf && holderCpfs.indexOf(cpf) !== index
    );

    if (repeatedCpfs.length > 0) {
      errors.push('Existem titulares com CPF repetido.');
    }

    return errors;
  }, [responsibleSaved, holderDraft, holders]);

  const isValid = validation.length === 0;

  function saveResponsible() {
    const errors: string[] = [];

    if (cnpj && !isValidCNPJ(cnpj)) errors.push('CNPJ inválido.');
    if (!responsibleName.trim()) errors.push('Informe o nome.');
    if (onlyDigits(responsibleCpf).length !== 11)
      errors.push('Informe os 11 dígitos do CPF.');
    if (!responsibleBirthDate) errors.push('Informe o nascimento.');
    if (!isValidEmail(responsibleEmail)) errors.push('Informe um e-mail válido.');
    if (onlyDigits(responsiblePhone).length < 10)
      errors.push('Informe um telefone válido.');

    if (errors.length > 0) {
      setResponsibleFormError(errors.join(' '));
      return;
    }

    setResponsibleFormError(null);
    setResponsibleSaved(true);
  }

  function editResponsible() {
    setResponsibleSaved(false);
    setResponsibleFormError(null);
  }

  function clearResponsible() {
    setCompanyName('');
    setCnpj('');
    setResponsibleName('');
    setResponsibleCpf('');
    setResponsibleBirthDate('');
    setResponsibleEmail('');
    setResponsiblePhone('');
    setResponsibleSaved(false);
    setResponsibleFormError(null);
  }

  function addHolder() {
    if (!responsibleSaved || holderDraft) return;
    setHolderDraft(newHolder());
    setHolderFormError(null);
  }

  function removeHolder(id: string) {
    setHolders((prev) => prev.filter((holder) => holder.id !== id));
  }

  function editHolder(holder: HolderField) {
    if (holderDraft) return;
    setHolderDraft({ ...holder });
    setHolderFormError(null);
  }

  function updateHolderDraft(patch: Partial<HolderField>) {
    setHolderDraft((current) =>
      current ? { ...current, ...patch } : current
    );
  }

  function cancelHolder() {
    setHolderDraft(null);
    setHolderFormError(null);
  }

  function saveHolder() {
    if (!holderDraft) return;

    const errors: string[] = [];
    if (!holderDraft.name.trim()) errors.push('Informe o nome.');
    if (onlyDigits(holderDraft.cpf).length !== 11)
      errors.push('Informe os 11 dígitos do CPF.');
    if (!holderDraft.birthDate) errors.push('Informe o nascimento.');
    if (!isValidEmail(holderDraft.email)) errors.push('Informe um e-mail válido.');
    if (onlyDigits(holderDraft.phone).length < 10)
      errors.push('Informe um telefone válido.');

    const repeatedCpf = holders.some(
      (holder) =>
        holder.id !== holderDraft.id &&
        onlyDigits(holder.cpf) === onlyDigits(holderDraft.cpf)
    );
    if (repeatedCpf) errors.push('Este CPF já está no grupo.');

    if (errors.length > 0) {
      setHolderFormError(errors.join(' '));
      return;
    }

    setHolders((current) => {
      const alreadyExists = current.some(
        (holder) => holder.id === holderDraft.id
      );

      return alreadyExists
        ? current.map((holder) =>
            holder.id === holderDraft.id ? holderDraft : holder
          )
        : [...current, holderDraft];
    });
    setHolderDraft(null);
    setHolderFormError(null);
  }

  function generateGroupPdf() {
    if (!isValid) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
      setSubmitError(
        'O navegador bloqueou a janela do PDF. Autorize pop-ups e tente novamente.'
      );
      return;
    }

    const holderRows = holders
      .map(
        (holder, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(holder.name.trim())}</td>
            <td>${escapeHtml(maskCPF(holder.cpf))}</td>
            <td>${escapeHtml(formatBirthDateBR(holder.birthDate))}</td>
            <td>${escapeHtml(holder.email.trim().toLowerCase())}</td>
            <td>${escapeHtml(formatPhone(holder.phone))}</td>
            <td>${planLabel(holder.plan)}</td>
          </tr>
        `
      )
      .join('');

    const companyRows =
      companyName.trim() || cnpj
        ? `
          <div class="data-grid">
            ${
              companyName.trim()
                ? `<div><span>Empresa</span><strong>${escapeHtml(
                    companyName.trim()
                  )}</strong></div>`
                : ''
            }
            ${
              cnpj
                ? `<div><span>CNPJ</span><strong>${escapeHtml(cnpj)}</strong></div>`
                : ''
            }
          </div>
        `
        : '';

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relação prévia do plano coletivo</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              color: #12324a;
              font-family: Arial, Helvetica, sans-serif;
              background: #fff;
            }
            h1 { margin: 0; color: #0b4267; font-size: 26px; }
            h2 { margin: 28px 0 10px; color: #0b4267; font-size: 17px; }
            .subtitle { margin: 8px 0 24px; color: #557086; font-size: 13px; }
            .data-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            .data-grid div {
              border: 1px solid #d9e6ee;
              border-radius: 8px;
              padding: 10px;
            }
            .data-grid span {
              display: block;
              margin-bottom: 4px;
              color: #668096;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #d9e6ee;
              padding: 8px 6px;
              text-align: left;
              vertical-align: top;
            }
            th { color: #0b4267; background: #eef8fb; }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-top: 20px;
            }
            .summary div {
              border-radius: 8px;
              padding: 12px;
              color: #0b4267;
              background: #eafaf5;
            }
            .summary span { display: block; font-size: 10px; }
            .summary strong { display: block; margin-top: 4px; font-size: 16px; }
            .notice {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #d9e6ee;
              color: #668096;
              font-size: 10px;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <h1>ConsulToque — Relação prévia do plano coletivo</h1>
          <p class="subtitle">
            Gerado em ${new Date().toLocaleString('pt-BR')} · Indicador:
            ${escapeHtml(getCodColab())}
          </p>

          ${companyRows}

          <h2>Responsável financeiro</h2>
          <div class="data-grid">
            <div><span>Nome</span><strong>${escapeHtml(
              responsibleName.trim()
            )}</strong></div>
            <div><span>CPF</span><strong>${escapeHtml(
              maskCPF(responsibleCpf)
            )}</strong></div>
            <div><span>Nascimento</span><strong>${escapeHtml(
              formatBirthDateBR(responsibleBirthDate)
            )}</strong></div>
            <div><span>E-mail</span><strong>${escapeHtml(
              responsibleEmail.trim().toLowerCase()
            )}</strong></div>
            <div><span>Telefone</span><strong>${escapeHtml(
              formatPhone(responsiblePhone)
            )}</strong></div>
          </div>

          <h2>Titulares</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Nascimento</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Plano</th>
              </tr>
            </thead>
            <tbody>${holderRows}</tbody>
          </table>

          <div class="summary">
            <div><span>Individuais</span><strong>${breakdown.individualCount}</strong></div>
            <div><span>Familiares</span><strong>${breakdown.familyCount}</strong></div>
            <div><span>Total</span><strong>${breakdown.total}</strong></div>
            <div><span>Valor mensal</span><strong>R$ ${breakdown.totalMonthly
              .toFixed(2)
              .replace('.', ',')}</strong></div>
          </div>

          <p class="notice">
            Documento de conferência gerado antes da contratação. Esta relação
            não confirma pagamento nem ativação dos serviços.
          </p>
          <script>
            window.addEventListener('load', function () {
              setTimeout(function () { window.print(); }, 250);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setSubmitError(null);
  }

  function openTerms() {
    if (!isValid || submitting) return;
    setAcceptedTerms(false);
    setShowTerms(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !acceptedTerms || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const agora = new Date().toISOString();
    const codColab = getCodColab();

    const payload = {
      origem: 'site_consultoque_empresas',
      enviado_em: agora,

      cod_colab: codColab,

      nome_assoc: responsibleName.trim(),
      cpf_assoc: onlyDigits(responsibleCpf),
      nasc_assoc: formatBirthDateBR(responsibleBirthDate),
      email_assoc: responsibleEmail.trim().toLowerCase(),
      tel_assoc: onlyDigits(responsiblePhone),
      empresa: companyName.trim(),
      cnpj: onlyDigits(cnpj),

      assoc_cpf_validado: CPF_VALIDATION_TEMPORARILY_DISABLED,
      assoc_maior_idade: true,

      qtd_individual: breakdown.individualCount,
      qtd_familiar: breakdown.familyCount,
      vl_individual:
        breakdown.individualCount * breakdown.individualUnit,
      vl_familiar: breakdown.familyCount * breakdown.familyUnit,
      vl_total: breakdown.totalMonthly,

      desconto_coletivo: breakdown.hasBulkDiscount,
      economia_mensal: breakdown.savings,

      termos_aceitos: true,
      termos_aceitos_em: agora,
      versao_termo: 'COLETIVO_V1',

      titulares: holders.map((holder) => ({
        cpf_titular: onlyDigits(holder.cpf),
        nome_titular: holder.name.trim(),
        nasc_titular: formatBirthDateBR(holder.birthDate),
        email_titular: holder.email.trim().toLowerCase(),
        tel_titular: onlyDigits(holder.phone),
        cod_plano: holder.plan === 'individual' ? '1830' : '1832',
      })),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await res.json().catch(() => null)) as
        | Partial<PaymentResponse>
        | null;

      if (!res.ok) {
        throw new Error(result?.message || `HTTP ${res.status}`);
      }

      if (
        !result ||
        typeof result.url_pagamento !== 'string' ||
        !/^https?:\/\//i.test(result.url_pagamento)
      ) {
        throw new Error('O servidor não retornou o link do boleto.');
      }

      setPaymentResponse({
        status: String(result.status || 'sucesso'),
        message: String(
          result.message ||
            'Boleto emitido com sucesso. Enviamos também o link para seu e-mail.'
        ),
        url_pagamento: result.url_pagamento,
        dt_vencimento: String(result.dt_vencimento || ''),
        dia_vencimento: String(result.dia_vencimento || ''),
        email: String(result.email || responsibleEmail.trim().toLowerCase()),
      });
      setShowTerms(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Não foi possível enviar: ${err.message}`
          : 'Não foi possível enviar o formulário.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ocean-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-mint-200 bg-white p-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <CheckCircle2 className="h-9 w-9 text-mint-600" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ocean-900">
              Boleto emitido com sucesso!
            </h1>
            <p className="mt-3 text-ocean-600">
              Recebemos a inscrição coletiva de{' '}
              <strong>{breakdown.total}</strong> titular(es). O link do boleto
              também foi enviado para{' '}
              <strong>{paymentResponse?.email || responsibleEmail}</strong>.
            </p>
            <div className="mt-6 rounded-2xl bg-ocean-50 p-5 text-left">
              <p className="text-sm text-ocean-700">
                Valor mensal total:{' '}
                <strong className="text-mint-700">
                  R$ {breakdown.totalMonthly.toFixed(2).replace('.', ',')}
                </strong>
              </p>
              {paymentResponse?.dt_vencimento && (
                <p className="mt-2 text-sm text-ocean-700">
                  Vencimento:{' '}
                  <strong className="text-ocean-900">
                    {paymentResponse.dt_vencimento}
                  </strong>
                </p>
              )}
              {breakdown.hasBulkDiscount && (
                <p className="mt-1 text-xs text-mint-600">
                  Desconto coletivo aplicado ({breakdown.total} inscrições).
                </p>
              )}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {paymentResponse?.url_pagamento && (
                <a
                  href={paymentResponse.url_pagamento}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Abrir boleto
                </a>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-ocean-200 px-6 py-3 font-bold text-ocean-700 transition-colors hover:bg-ocean-50"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-50">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 hover:text-ocean-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="mt-6 max-w-3xl">
          <span className="section-eyebrow">Inscrição Coletiva</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ocean-900 sm:text-4xl">
            Monte o plano coletivo da sua empresa
          </h1>
          <p className="mt-3 text-ocean-600">
            Preencha os dados do responsável e adicione os titulares. Nome da
            empresa e CNPJ são opcionais. O valor é calculado em tempo real.
          </p>
        </div>

        <form
          id="collective-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
        >
          {/* Main column */}
          <div className="space-y-8">
            {/* Company + responsible */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-ocean-900">
                  1. Responsável pelo grupo
                </h2>
                {responsibleSaved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Salvo
                  </span>
                )}
              </div>

              {!responsibleSaved ? (
                <div className="mt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="label-field" htmlFor="companyName">
                        Nome da empresa (opcional)
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="input-field"
                        placeholder="Razão social ou nome fantasia, se houver"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="cnpj">
                        CNPJ da empresa (opcional)
                      </label>
                      <input
                        id="cnpj"
                        type="text"
                        inputMode="numeric"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                        className="input-field"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsibleName">
                        Nome do responsável pelo pagamento
                      </label>
                      <input
                        id="responsibleName"
                        type="text"
                        value={responsibleName}
                        onChange={(e) => setResponsibleName(e.target.value)}
                        className="input-field"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsibleCpf">
                        CPF do responsável
                      </label>
                      <input
                        id="responsibleCpf"
                        type="text"
                        inputMode="numeric"
                        value={responsibleCpf}
                        onChange={(e) =>
                          setResponsibleCpf(formatCPF(e.target.value))
                        }
                        className="input-field"
                        placeholder="000.000.000-00"
                      />
                      <p className="mt-2 text-xs font-semibold text-amber-600">
                        Validação de CPF temporariamente liberada para testes.
                      </p>
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsibleEmail">
                        E-mail do responsável
                      </label>
                      <input
                        id="responsibleEmail"
                        type="email"
                        value={responsibleEmail}
                        onChange={(e) => setResponsibleEmail(e.target.value)}
                        className="input-field"
                        placeholder="responsavel@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsiblePhone">
                        Telefone do responsável
                      </label>
                      <input
                        id="responsiblePhone"
                        type="tel"
                        inputMode="numeric"
                        value={responsiblePhone}
                        onChange={(e) =>
                          setResponsiblePhone(formatPhone(e.target.value))
                        }
                        className="input-field"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label
                        className="label-field"
                        htmlFor="responsibleBirthDate"
                      >
                        Nascimento do responsável
                      </label>
                      <input
                        id="responsibleBirthDate"
                        type="date"
                        value={responsibleBirthDate}
                        onChange={(e) => setResponsibleBirthDate(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {responsibleFormError && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                      {responsibleFormError}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={saveResponsible}
                      className="btn-primary"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Salvar responsável
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-mint-200 bg-mint-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-ocean-900">
                        {responsibleName}
                      </p>
                      {companyName && (
                        <p className="mt-1 text-sm font-semibold text-ocean-600">
                          {companyName}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-ocean-600">
                        {maskCPF(responsibleCpf)} · {responsibleEmail}
                      </p>
                      <p className="mt-1 text-sm text-ocean-500">
                        {responsiblePhone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={editResponsible}
                        className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-4 py-2 text-sm font-bold text-ocean-700 hover:bg-ocean-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={clearResponsible}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Holders */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-ocean-900">
                  2. Titulares ({holders.length})
                </h2>
                <button
                  type="button"
                  onClick={addHolder}
                  disabled={!responsibleSaved || !!holderDraft}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-blue transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar titular
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {holders.length === 0 && !holderDraft && (
                  <div className="rounded-2xl border border-dashed border-ocean-200 bg-ocean-50/50 p-6 text-center">
                    <p className="font-semibold text-ocean-700">
                      Nenhum titular salvo.
                    </p>
                    <p className="mt-1 text-sm text-ocean-500">
                      Salve o responsável e use “Adicionar titular”.
                    </p>
                  </div>
                )}

                {holders.map((holder, idx) => (
                  holderDraft?.id === holder.id ? null : (
                  <div
                    key={holder.id}
                    className="rounded-2xl border border-ocean-100 bg-ocean-50/50 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-xs font-black uppercase tracking-wide text-ocean-500">
                            Titular #{idx + 1}
                          </p>
                          <span className="rounded-full bg-mint-100 px-2.5 py-1 text-xs font-bold text-mint-700">
                            {planLabel(holder.plan)}
                          </span>
                        </div>
                        <p className="mt-2 truncate font-display text-lg font-bold text-ocean-900">
                          {holder.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => editHolder(holder)}
                          disabled={!!holderDraft}
                          className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-3 py-2 text-sm font-bold text-ocean-700 hover:bg-ocean-50 disabled:opacity-40"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHolder(holder.id)}
                          disabled={!!holderDraft}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                          aria-label="Remover titular"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                ))}

                {holderDraft && (
                  <div className="rounded-2xl border-2 border-mint-300 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-bold text-ocean-900">
                          {holders.some((holder) => holder.id === holderDraft.id)
                            ? 'Editar titular'
                            : 'Novo titular'}
                        </p>
                        <p className="mt-1 text-sm text-ocean-500">
                          Preencha os dados e salve para fechar este cartão.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={cancelHolder}
                        className="rounded-xl p-2 text-ocean-500 hover:bg-ocean-50"
                        aria-label="Cancelar edição"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(
                        [
                          { key: 'individual', label: 'Individual', icon: User, price: 'R$ 33/mês' },
                          { key: 'familia', label: 'Familiar', icon: Heart, price: 'R$ 66/mês' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            updateHolderDraft({ plan: opt.key })
                          }
                          className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all sm:min-h-0 sm:flex-row sm:justify-start sm:gap-2 ${
                            holderDraft.plan === opt.key
                              ? 'border-mint-500 bg-mint-50 text-mint-700'
                              : 'border-ocean-200 bg-white text-ocean-600 hover:border-ocean-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                          </span>

                          <span className="text-xs text-ocean-400 sm:ml-auto">
                            {opt.price}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="label-field">
                          Nome do titular
                        </label>
                        <input
                          type="text"
                          value={holderDraft.name}
                          onChange={(e) =>
                            updateHolderDraft({ name: e.target.value })
                          }
                          className="input-field"
                          placeholder="Nome completo do titular"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label-field">CPF do titular</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={holderDraft.cpf}
                            onChange={(e) =>
                              updateHolderDraft({
                                cpf: formatCPF(e.target.value),
                              })
                            }
                            className="input-field"
                            placeholder="000.000.000-00"
                          />
                        </div>

                        <div>
                          <label className="label-field">
                            Nascimento do titular
                          </label>
                          <input
                            type="date"
                            value={holderDraft.birthDate}
                            onChange={(e) =>
                              updateHolderDraft({
                                birthDate: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="label-field">
                            E-mail do titular
                          </label>
                          <input
                            type="email"
                            value={holderDraft.email}
                            onChange={(e) =>
                              updateHolderDraft({
                                email: e.target.value,
                              })
                            }
                            className="input-field"
                            placeholder="titular@email.com"
                          />
                        </div>

                        <div>
                          <label className="label-field">
                            Telefone do titular
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={holderDraft.phone}
                            onChange={(e) =>
                              updateHolderDraft({
                                phone: formatPhone(e.target.value),
                              })
                            }
                            className="input-field"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </div>

                    {holderFormError && (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                        {holderFormError}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancelHolder}
                        className="inline-flex items-center justify-center rounded-xl border border-ocean-200 px-5 py-3 text-sm font-bold text-ocean-700 hover:bg-ocean-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveHolder}
                        className="btn-primary"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Salvar titular
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Terms */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-bold text-ocean-900">
                3. Termos de adesão
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ocean-700">
                Depois de salvar todos os cartões, você pode gerar a lista em
                PDF. Ao emitir o boleto, o Termo de Adesão será exibido para
                leitura e aceite antes do envio.
              </p>
            </section>
          </div>

          {/* Sticky summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-mint-600" />
                <h3 className="font-display text-lg font-bold text-ocean-900">
                  Resumo do pedido
                </h3>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ocean-600">Individuais</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.individualCount} × R${' '}
                    {breakdown.individualUnit.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-600">Familiares</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.familyCount} × R${' '}
                    {breakdown.familyUnit.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-ocean-100 pt-3">
                  <span className="text-ocean-600">Total de inscrições</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.total}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-mint-gradient p-5 text-white">
                <p className="text-sm text-white/85">Valor mensal total</p>
                <p className="mt-1 font-display text-3xl font-extrabold">
                  R$ {breakdown.totalMonthly.toFixed(2).replace('.', ',')}
                </p>
                {breakdown.hasBulkDiscount && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Desconto coletivo aplicado
                  </p>
                )}
                {breakdown.savings > 0 && (
                  <p className="mt-2 text-xs text-white/85">
                    Você economiza R${' '}
                    {breakdown.savings.toFixed(2).replace('.', ',')}/mês
                  </p>
                )}
              </div>

              {breakdown.total < BULK_THRESHOLD && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-ocean-400" />
                  <span>
                    Faltam {BULK_THRESHOLD - breakdown.total} inscrição(ões) para
                    o desconto coletivo (a partir de {BULK_THRESHOLD} no total).
                  </span>
                </div>
              )}

              {/* Validation summary */}
              {!isValid && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Corrija antes de enviar:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-amber-700">
                    {validation.slice(0, 5).map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={generateGroupPdf}
                disabled={!isValid || submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ocean-200 bg-white px-6 py-3.5 text-sm font-bold text-ocean-700 transition-colors enabled:hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                Gerar lista em PDF
              </button>

              <button
                type="button"
                onClick={openTerms}
                disabled={!isValid || submitting}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-4 text-base font-bold text-white shadow-glow-blue transition-all duration-300 enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-5 w-5" />
                Emitir boleto e concluir
              </button>

              {submitError && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                  {submitError}
                </p>
              )}
            </div>
          </aside>
        </form>

        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-ocean-100 px-6 py-5 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-mint-600">
                      Etapa final
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-ocean-900">
                      Termo de Adesão ao Plano Coletivo
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTerms(false)}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-ocean-600 hover:bg-ocean-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto px-6 py-6 text-sm leading-relaxed text-ocean-700 sm:px-8">
                <p>
                  Ao aderir, o responsável confirma que os dados da organização,
                  do responsável financeiro e dos beneficiários são verdadeiros
                  e autoriza seu uso para cadastro, cobrança e disponibilização
                  dos serviços contratados.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  1. Objeto da adesão
                </h3>
                <p className="mt-1">
                  A contratação compreende o acesso aos serviços de
                  telemedicina e aos benefícios informados no site, de acordo
                  com a composição e a quantidade de inscrições selecionadas.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  2. Valores e desconto coletivo
                </h3>
                <p className="mt-1">
                  O valor mensal é calculado conforme as inscrições escolhidas.
                  Ao atingir 10 inscrições no total, aplica-se automaticamente
                  o preço coletivo indicado no resumo. A redução deixa de valer
                  se a quantidade ficar abaixo do mínimo contratado.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  3. Responsabilidade pelos dados
                </h3>
                <p className="mt-1">
                  O responsável declara possuir autorização para cadastrar os
                  titulares e dependentes e compromete-se a manter os dados
                  atualizados. Cada CPF deve identificar corretamente o
                  respectivo beneficiário.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  4. Pagamento e ativação
                </h3>
                <p className="mt-1">
                  A contratação será registrada como não paga. A ativação dos
                  serviços ocorrerá após a confirmação do pagamento pelo
                  sistema de cobrança e o processamento dos cadastros. A falta
                  de pagamento poderá inativar os acessos.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  5. Telemedicina e emergências
                </h3>
                <p className="mt-1">
                  A telemedicina não substitui atendimento presencial de
                  urgência ou emergência. Nessas situações, deve-se procurar
                  imediatamente um serviço de pronto atendimento ou acionar o
                  SAMU pelo número 192.
                </p>

                <h3 className="mt-5 font-bold text-ocean-900">
                  6. Privacidade
                </h3>
                <p className="mt-1">
                  Os dados serão tratados para executar a contratação,
                  administrar os beneficiários, realizar cobranças e integrar
                  os prestadores necessários, observadas as regras aplicáveis
                  de proteção de dados.
                </p>
              </div>

              <div className="border-t border-ocean-100 bg-ocean-50 px-6 py-5 sm:px-8">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-ocean-300 text-mint-600 focus:ring-mint-400"
                  />
                  <span className="text-sm font-semibold leading-relaxed text-ocean-800">
                    Li integralmente e concordo com o Termo de Adesão, com as
                    regras de cobrança, ativação, tratamento de dados e uso dos
                    serviços.
                  </span>
                </label>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTerms(false)}
                    className="rounded-xl border border-ocean-200 px-5 py-3 font-bold text-ocean-700"
                  >
                    Voltar e revisar
                  </button>

                  <button
                    type="submit"
                    form="collective-form"
                    disabled={!acceptedTerms || submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 font-bold text-white shadow-glow-blue disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cadastrando e emitindo boleto...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Aceitar e confirmar contratação
                      </>
                    )}
                  </button>
                </div>

                {submitError && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                    {submitError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}