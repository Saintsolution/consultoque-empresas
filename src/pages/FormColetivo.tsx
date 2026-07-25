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
} from 'lucide-react';
import {
  type HolderEntry,
  type PlanType,
  calculatePrice,
  formatCPF,
  formatCNPJ,
  formatPhone,
  onlyDigits,
  isValidCPF,
  isValidCNPJ,
  isValidEmail,
  BULK_THRESHOLD,
} from '@/lib/pricing';

/*
 * Endereços provisórios. Depois substituímos pelos caminhos
 * definitivos publicados no n8n.
 */
const WEBHOOK_URL =
  'https://n8n.saintsolution.com.br/webhook/coletivo-empresarial';

const WEBHOOK_VALIDAR_RESPONSAVEL =
  'https://n8n.saintsolution.com.br/webhook/validar-responsavel-coletivo';

interface HolderField {
  id: string;
  plan: PlanType;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
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

export default function FormColetivo() {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [responsibleBirthDate, setResponsibleBirthDate] = useState('');
  const [responsibleEmail, setResponsibleEmail] = useState('');
  const [responsiblePhone, setResponsiblePhone] = useState('');
  const [responsibleCpfValidated, setResponsibleCpfValidated] = useState(false);
  const [checkingResponsible, setCheckingResponsible] = useState(false);
  const [responsibleCheckError, setResponsibleCheckError] =
    useState<string | null>(null);
  const [holders, setHolders] = useState<HolderField[]>([newHolder()]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const breakdown = useMemo(
    () => calculatePrice(holders.map(toHolderEntry)),
    [holders]
  );

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!companyName.trim()) errors.push('Informe o nome da empresa.');
    if (!isValidCNPJ(cnpj)) errors.push('CNPJ da empresa inválido.');
    if (!responsibleName.trim()) errors.push('Informe o nome do responsável.');
    if (!isValidCPF(responsibleCpf)) errors.push('CPF do responsável inválido.');
    if (!responsibleCpfValidated)
      errors.push('Valide o CPF e a maioridade do responsável.');
    if (!responsibleBirthDate)
      errors.push('Informe o nascimento do responsável.');
    if (!isValidEmail(responsibleEmail))
      errors.push('E-mail do responsável inválido.');
    if (onlyDigits(responsiblePhone).length < 10)
      errors.push('Telefone do responsável inválido.');

    const invalidHolders = holders.filter(
      (h) =>
        !h.name.trim() ||
        !isValidCPF(h.cpf) ||
        !isValidEmail(h.email) ||
        onlyDigits(h.phone).length < 10 ||
        !h.birthDate
    );
    if (invalidHolders.length > 0) {
      errors.push(
        `Existem ${invalidHolders.length} titular(es) com dados incompletos ou inválidos.`
      );
    }
    if (holders.length === 0) errors.push('Adicione pelo menos 1 titular.');
    return errors;
  }, [
    companyName,
    cnpj,
    responsibleName,
    responsibleCpf,
    responsibleBirthDate,
    responsibleEmail,
    responsiblePhone,
    responsibleCpfValidated,
    holders,
  ]);

  const isValid = validation.length === 0;

  function addHolder() {
    setHolders((prev) => [...prev, newHolder()]);
  }

  function removeHolder(id: string) {
    setHolders((prev) => (prev.length > 1 ? prev.filter((h) => h.id !== id) : prev));
  }

  function updateHolder(id: string, patch: Partial<HolderField>) {
    setHolders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }

  async function validateResponsibleCpf() {
    if (!isValidCPF(responsibleCpf) || checkingResponsible) return;

    setCheckingResponsible(true);
    setResponsibleCheckError(null);
    setResponsibleCpfValidated(false);

    try {
      const response = await fetch(WEBHOOK_VALIDAR_RESPONSAVEL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: onlyDigits(responsibleCpf),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (!result?.cpf_validado) {
        throw new Error('CPF não validado.');
      }

      if (!result?.maior_idade) {
        throw new Error('O responsável financeiro precisa ser maior de idade.');
      }

      setResponsibleCpfValidated(true);

      if (!responsibleName.trim() && result.nome) {
        setResponsibleName(String(result.nome));
      }

      if (!responsibleBirthDate && result.data_nascimento) {
        setResponsibleBirthDate(
          String(result.data_nascimento).slice(0, 10)
        );
      }
    } catch (error) {
      setResponsibleCheckError(
        error instanceof Error
          ? error.message
          : 'Não foi possível validar o CPF.'
      );
    } finally {
      setCheckingResponsible(false);
    }
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

    const payload = {
      origem: 'site_consultoque_empresas',
      origem_form: 'coletivo_empresarial',
      enviado_em: agora,

      assoc_empresa: companyName.trim(),
      assoc_cnpj: onlyDigits(cnpj),
      assoc_nome: responsibleName.trim(),
      assoc_cpf: onlyDigits(responsibleCpf),
      assoc_nasc: responsibleBirthDate,
      assoc_email: responsibleEmail.trim().toLowerCase(),
      assoc_tel: onlyDigits(responsiblePhone),
      assoc_cpf_validado: responsibleCpfValidated,
      assoc_maior_idade: true,

      tit_ind: breakdown.individualCount,
      tit_fam: breakdown.familyCount,
      tit_total: breakdown.total,
      vl_ind: breakdown.individualUnit,
      vl_fam: breakdown.familyUnit,
      vl_total: breakdown.totalMonthly,
      desconto_coletivo: breakdown.hasBulkDiscount,
      economia_mensal: breakdown.savings,

      status_venda: 'pendente',
      termos_aceitos: true,
      termos_aceitos_em: agora,
      versao_termo: 'COLETIVO_V1',

      titulares: holders.map((holder) => ({
        tipo_titular: holder.plan,
        cod_plano: holder.plan === 'individual' ? 'c1380' : 'c1382',
        tipo_plano: holder.plan === 'individual' ? 1380 : 1382,
        tit_nome: holder.name.trim(),
        tit_cpf: onlyDigits(holder.cpf),
        tit_nasc: holder.birthDate,
        tit_email: holder.email.trim().toLowerCase(),
        tit_tel: onlyDigits(holder.phone),
        status_titular: 'inativo',
      })),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
              Inscrição enviada com sucesso!
            </h1>
            <p className="mt-3 text-ocean-600">
              Recebemos a inscrição coletiva de{' '}
              <strong>{breakdown.total}</strong> titular(es) para{' '}
              <strong>{companyName}</strong>. Em breve entraremos em contato pelo
              e-mail <strong>{responsibleEmail}</strong>.
            </p>
            <div className="mt-6 rounded-2xl bg-ocean-50 p-5 text-left">
              <p className="text-sm text-ocean-700">
                Valor mensal total:{' '}
                <strong className="text-mint-700">
                  R$ {breakdown.totalMonthly.toFixed(2).replace('.', ',')}
                </strong>
              </p>
              {breakdown.hasBulkDiscount && (
                <p className="mt-1 text-xs text-mint-600">
                  Desconto coletivo aplicado ({breakdown.total} inscrições).
                </p>
              )}
            </div>
            <Link to="/" className="btn-primary mt-7">
              Voltar ao início
            </Link>
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
            Preencha os dados do responsável, o CNPJ da empresa e adicione os
            titulares. O valor é calculado em tempo real.
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
              <h2 className="font-display text-xl font-bold text-ocean-900">
                1. Dados da empresa e do responsável
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-field" htmlFor="companyName">
                    Nome da empresa
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-field"
                    placeholder="Razão social ou nome fantasia"
                  />
                </div>
                <div>
                  <label className="label-field" htmlFor="cnpj">
                    CNPJ da empresa
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
                  <div className="flex gap-2">
                    <input
                      id="responsibleCpf"
                      type="text"
                      inputMode="numeric"
                      value={responsibleCpf}
                      onChange={(e) => {
                        setResponsibleCpf(formatCPF(e.target.value));
                        setResponsibleCpfValidated(false);
                        setResponsibleCheckError(null);
                      }}
                      className="input-field min-w-0 flex-1"
                      placeholder="000.000.000-00"
                    />
                    <button
                      type="button"
                      onClick={validateResponsibleCpf}
                      disabled={
                        !isValidCPF(responsibleCpf) || checkingResponsible
                      }
                      className="rounded-xl bg-ocean-900 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {checkingResponsible ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : responsibleCpfValidated ? (
                        'Validado'
                      ) : (
                        'Validar'
                      )}
                    </button>
                  </div>
                  {responsibleCheckError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {responsibleCheckError}
                    </p>
                  )}
                  {responsibleCpfValidated && (
                    <p className="mt-2 text-xs font-semibold text-mint-700">
                      CPF válido e responsável maior de idade.
                    </p>
                  )}
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
                  <label className="label-field" htmlFor="responsibleBirthDate">
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
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-blue transition-transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar titular
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {holders.map((holder, idx) => (
                  <div
                    key={holder.id}
                    className="rounded-2xl border border-ocean-100 bg-ocean-50/50 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-bold text-ocean-700">
                        Titular #{idx + 1}
                      </p>
                      {holders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHolder(holder.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                          aria-label="Remover titular"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      )}
                    </div>

                    {/* Plan selector */}
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
                            updateHolder(holder.id, { plan: opt.key })
                          }
                          className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all sm:min-h-0 sm:flex-row sm:justify-start sm:gap-2 ${
                            holder.plan === opt.key
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
                          value={holder.name}
                          onChange={(e) =>
                            updateHolder(holder.id, { name: e.target.value })
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
                            value={holder.cpf}
                            onChange={(e) =>
                              updateHolder(holder.id, {
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
                            value={holder.birthDate}
                            onChange={(e) =>
                              updateHolder(holder.id, {
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
                            value={holder.email}
                            onChange={(e) =>
                              updateHolder(holder.id, {
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
                            value={holder.phone}
                            onChange={(e) =>
                              updateHolder(holder.id, {
                                phone: formatPhone(e.target.value),
                              })
                            }
                            className="input-field"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Terms */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-bold text-ocean-900">
                3. Termos de adesão
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ocean-700">
                Depois de conferir os dados, clique em contratar. O Termo de
                Adesão será exibido para leitura e aceite antes do envio.
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
                onClick={openTerms}
                disabled={!isValid || submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-4 text-base font-bold text-white shadow-glow-blue transition-all duration-300 enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-5 w-5" />
                Contratar plano coletivo
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
                  A inscrição será enviada com status pendente. A ativação dos
                  serviços ocorrerá após a confirmação do pagamento e o
                  processamento dos cadastros. A falta de pagamento poderá
                  suspender ou inativar os acessos.
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
                        Enviando...
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