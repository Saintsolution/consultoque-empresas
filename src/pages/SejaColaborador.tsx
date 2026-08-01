import {
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Network,
  UserPlus,
} from 'lucide-react';

const WEBHOOK_CADASTRO =
  'https://n8n.saintsolution.com.br/webhook/colaborador-cadastro';

type FormularioColaborador = {
  nome_colab: string;
  cpf_colab: string;
  email_colab: string;
  tel_colab: string;
  pix_colab: string;
  senha: string;
  confirmar_senha: string;
  termos_aceitos: boolean;
};

type RespostaCadastro = {
  status?: string;
  sucesso?: boolean;
  mensagem?: string;
  message?: string;
  cod_colab?: string | number;
  cod_pai?: string | number;
  link_indicacao?: string;
};

const formularioInicial:
  FormularioColaborador = {
    nome_colab: '',
    cpf_colab: '',
    email_colab: '',
    tel_colab: '',
    pix_colab: '',
    senha: '',
    confirmar_senha: '',
    termos_aceitos: false,
  };

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

function formatarTelefone(
  valor: string
) {
  const numeros =
    somenteNumeros(valor)
      .slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(
        /^(\d{2})(\d)/,
        '($1) $2'
      )
      .replace(
        /(\d{4})(\d)/,
        '$1-$2'
      );
  }

  return numeros
    .replace(
      /^(\d{2})(\d)/,
      '($1) $2'
    )
    .replace(
      /(\d{5})(\d)/,
      '$1-$2'
    );
}

function normalizarCodigo(
  valor: unknown
) {
  const numeros =
    somenteNumeros(
      String(valor ?? '')
    );

  if (
    numeros.length >= 1 &&
    numeros.length <= 4
  ) {
    return numeros.padStart(
      4,
      '0'
    );
  }

  return '';
}

function buscarCookie(
  nome: string
) {
  const prefixo =
    `${nome}=`;

  const cookie =
    document.cookie
      .split(';')
      .map((item) =>
        item.trim()
      )
      .find((item) =>
        item.startsWith(prefixo)
      );

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(
    cookie.slice(
      prefixo.length
    )
  );
}

function buscarCodigoPai() {
  const indicadorLocal =
    localStorage.getItem(
      'indicador_colab'
    );

  const indicadorCookie =
    buscarCookie(
      'indicador_colab'
    );

  return (
    normalizarCodigo(
      indicadorLocal
    ) ||
    normalizarCodigo(
      indicadorCookie
    ) ||
    '0001'
  );
}

function validarCPF(
  cpf: string
) {
  const numeros =
    somenteNumeros(cpf);

  if (numeros.length !== 11) {
    return false;
  }

  if (
    /^(\d)\1{10}$/.test(
      numeros
    )
  ) {
    return false;
  }

  function calcularDigito(
    quantidade: number
  ) {
    let soma = 0;

    for (
      let indice = 0;
      indice < quantidade;
      indice += 1
    ) {
      soma +=
        Number(
          numeros[indice]
        ) *
        (
          quantidade +
          1 -
          indice
        );
    }

    const resto =
      (soma * 10) % 11;

    return resto === 10
      ? 0
      : resto;
  }

  const primeiroDigito =
    calcularDigito(9);

  const segundoDigito =
    calcularDigito(10);

  return (
    primeiroDigito ===
      Number(numeros[9]) &&
    segundoDigito ===
      Number(numeros[10])
  );
}

export default function SejaColaborador() {
  const [
    formulario,
    setFormulario,
  ] =
    useState<FormularioColaborador>(
      formularioInicial
    );

  const [
    enviando,
    setEnviando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    resultado,
    setResultado,
  ] =
    useState<RespostaCadastro | null>(
      null
    );

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [
    linkCopiado,
    setLinkCopiado,
  ] = useState(false);

  const codigoPai =
    useMemo(
      () => buscarCodigoPai(),
      []
    );

  function atualizarCampo<
    K extends keyof FormularioColaborador
  >(
    campo: K,
    valor:
      FormularioColaborador[K]
  ) {
    setFormulario(
      (estadoAnterior) => ({
        ...estadoAnterior,
        [campo]: valor,
      })
    );

    setErro('');
  }

  function validarFormulario() {
    const nome =
      formulario.nome_colab
        .trim();

    const cpf =
      somenteNumeros(
        formulario.cpf_colab
      );

    const telefone =
      somenteNumeros(
        formulario.tel_colab
      );

    const pix =
      formulario.pix_colab
        .trim();

    if (
      nome.split(/\s+/)
        .length < 2
    ) {
      return 'Informe o nome completo.';
    }

    if (!validarCPF(cpf)) {
      return 'Informe um CPF válido.';
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          formulario.email_colab
            .trim()
            .toLowerCase()
        );

    if (!emailValido) {
      return 'Informe um e-mail válido.';
    }

    if (
      telefone.length < 10 ||
      telefone.length > 11
    ) {
      return 'Informe um telefone válido com DDD.';
    }

    if (!pix) {
      return 'Informe a chave PIX para receber suas comissões.';
    }

    if (
      formulario.senha
        .length < 8
    ) {
      return 'A senha deve possuir pelo menos 8 caracteres.';
    }

    if (
      formulario.senha !==
      formulario
        .confirmar_senha
    ) {
      return 'A confirmação da senha está diferente.';
    }

    if (
      !formulario
        .termos_aceitos
    ) {
      return 'Você precisa aceitar os termos de colaboração.';
    }

    return '';
  }

  async function enviarCadastro(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    const erroValidacao =
      validarFormulario();

    if (erroValidacao) {
      setErro(
        erroValidacao
      );

      return;
    }

    setEnviando(true);
    setErro('');
    setResultado(null);

    const agora =
      new Date()
        .toISOString();

    const payload = {
      origem:
        'site_consultoque_empresas',

      finalidade:
        'CADASTRO_COLABORADOR',

      enviado_em: agora,

      cod_pai:
        codigoPai,

      nome_colab:
        formulario.nome_colab
          .trim()
          .replace(/\s+/g, ' '),

      cpf_colab:
        somenteNumeros(
          formulario.cpf_colab
        ),

      email_colab:
        formulario.email_colab
          .trim()
          .toLowerCase(),

      tel_colab:
        somenteNumeros(
          formulario.tel_colab
        ),

      pix_colab:
        formulario.pix_colab
          .trim(),

      /*
       * O n8n receberá a senha,
       * criará o hash e gravará
       * somente senha_hash.
       */
      senha:
        formulario.senha,

      termos_aceitos: true,

      termos_aceitos_em:
        agora,

      versao_termo:
        'COLABORADOR_V1',
    };

    try {
      const resposta =
        await fetch(
          WEBHOOK_CADASTRO,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      let dados:
        RespostaCadastro = {};

      try {
        dados =
          await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
          dados.message ||
          'Não foi possível concluir o cadastro.'
        );
      }

      const status =
        String(
          dados.status ?? ''
        )
          .trim()
          .toLowerCase();

      const cadastroAceito =
        dados.sucesso === true ||
        status === 'sucesso' ||
        Boolean(
          dados.cod_colab
        );

      if (!cadastroAceito) {
        throw new Error(
          dados.mensagem ||
          dados.message ||
          'O cadastro não foi confirmado.'
        );
      }

      setResultado(
        dados
      );

      setFormulario(
        formularioInicial
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (
      erroRecebido
    ) {
      setErro(
        erroRecebido
          instanceof Error
          ? erroRecebido.message
          : 'Não foi possível enviar o cadastro.'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function copiarLink() {
    const link =
      resultado
        ?.link_indicacao;

    if (!link) {
      return;
    }

    await navigator
      .clipboard
      .writeText(link);

    setLinkCopiado(true);

    window.setTimeout(
      () => {
        setLinkCopiado(false);
      },
      2000
    );
  }

  if (resultado) {
    const codigo =
      normalizarCodigo(
        resultado.cod_colab
      );

    return (
      <section className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="container-app">
          <div className="mx-auto mb-6 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-mint-400 hover:text-mint-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </div>

          <div className="mx-auto max-w-2xl rounded-3xl border border-mint-200 bg-white p-7 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <CheckCircle2 className="h-9 w-9 text-mint-600" />
            </div>

            <h1 className="mt-6 font-display text-3xl font-extrabold text-slate-900">
              Cadastro realizado!
            </h1>

            <p className="mt-3 text-slate-600">
              Seu cadastro como
              colaborador da ConsulToque
              foi concluído.
            </p>

            {codigo && (
              <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Seu código
                </p>

                <p className="mt-1 font-display text-4xl font-extrabold text-brand-600">
                  {codigo}
                </p>
              </div>
            )}

            {resultado
              .link_indicacao && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Seu link de indicação
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={
                      resultado
                        .link_indicacao
                    }
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  />

                  <button
                    type="button"
                    onClick={
                      copiarLink
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    {linkCopiado ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}

                    {linkCopiado
                      ? 'Copiado'
                      : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <Link
              to="/colaborador"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-mint-500 px-7 py-3 font-bold text-white transition hover:bg-mint-600"
            >
              Acessar área do colaborador
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container-app">
        <div className="mx-auto mb-6 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-mint-400 hover:text-mint-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-mint-500 p-7 text-white sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <UserPlus className="h-7 w-7" />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-widest text-white/75">
                ConsulToque
              </p>

              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                Seja um colaborador
              </h1>

              <p className="mt-4 leading-relaxed text-white/85">
                Compartilhe os benefícios
                da telemedicina, faça suas
                indicações e acompanhe suas
                comissões em uma área
                exclusiva.
              </p>

              <div className="mt-8 rounded-2xl bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <Network className="h-5 w-5" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/65">
                      Código do indicador
                    </p>

                    <p className="font-display text-2xl font-extrabold">
                      {codigoPai}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-4 text-sm text-white/85">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p>
                    Área exclusiva para
                    acompanhar indicações.
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p>
                    Informações sobre
                    comissões previstas e
                    recebidas.
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p>
                    Link individual para
                    compartilhar a
                    ConsulToque.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={
                enviarCadastro
              }
              className="p-7 sm:p-10"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-mint-600">
                  Inscrição
                </p>

                <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
                  Preencha seus dados
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Os dados serão usados
                  para identificação,
                  acesso e pagamento das
                  comissões.
                </p>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Nome completo
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={
                      formulario
                        .nome_colab
                    }
                    onChange={(
                      evento
                    ) =>
                      atualizarCampo(
                        'nome_colab',
                        evento.target
                          .value
                      )
                    }
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    CPF
                  </span>

                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    value={
                      formulario
                        .cpf_colab
                    }
                    onChange={(
                      evento
                    ) =>
                      atualizarCampo(
                        'cpf_colab',
                        formatarCPF(
                          evento.target
                            .value
                        )
                      )
                    }
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Telefone
                  </span>

                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={
                      formulario
                        .tel_colab
                    }
                    onChange={(
                      evento
                    ) =>
                      atualizarCampo(
                        'tel_colab',
                        formatarTelefone(
                          evento.target
                            .value
                        )
                      )
                    }
                    placeholder="(21) 99999-9999"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    E-mail
                  </span>

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={
                      formulario
                        .email_colab
                    }
                    onChange={(
                      evento
                    ) =>
                      atualizarCampo(
                        'email_colab',
                        evento.target
                          .value
                      )
                    }
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Chave PIX
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={
                      formulario
                        .pix_colab
                    }
                    onChange={(
                      evento
                    ) =>
                      atualizarCampo(
                        'pix_colab',
                        evento.target
                          .value
                      )
                    }
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                  />

                  <span className="mt-1.5 block text-xs text-slate-500">
                    Utilizaremos essa chave
                    para o pagamento das
                    comissões.
                  </span>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Crie uma senha
                  </span>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={
                        formulario
                          .senha
                      }
                      onChange={(
                        evento
                      ) =>
                        atualizarCampo(
                          'senha',
                          evento.target
                            .value
                        )
                      }
                      placeholder="Mínimo de 8 caracteres"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenha(
                          (valor) =>
                            !valor
                        )
                      }
                      aria-label={
                        mostrarSenha
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirme a senha
                  </span>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type={
                        mostrarConfirmacao
                          ? 'text'
                          : 'password'
                      }
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={
                        formulario
                          .confirmar_senha
                      }
                      onChange={(
                        evento
                      ) =>
                        atualizarCampo(
                          'confirmar_senha',
                          evento.target
                            .value
                        )
                      }
                      placeholder="Digite novamente"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 text-slate-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          (valor) =>
                            !valor
                        )
                      }
                      aria-label={
                        mostrarConfirmacao
                          ? 'Ocultar confirmação'
                          : 'Mostrar confirmação'
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    formulario
                      .termos_aceitos
                  }
                  onChange={(
                    evento
                  ) =>
                    atualizarCampo(
                      'termos_aceitos',
                      evento.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-mint-500"
                />

                <span className="text-sm leading-relaxed text-slate-600">
                  Declaro que li e aceito
                  os termos de colaboração.
                  Estou ciente de que não
                  existe vínculo
                  empregatício, obrigação
                  de horário ou garantia
                  de remuneração fixa. As
                  comissões são calculadas
                  sobre indicações
                  confirmadas e podem estar
                  sujeitas às obrigações
                  fiscais aplicáveis.
                </span>
              </label>

              {erro && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint-500 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-mint-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando cadastro...
                  </>
                ) : (
                  <>
                    Quero ser colaborador
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-5 text-center text-sm text-slate-500">
                Já possui cadastro?{' '}

                <Link
                  to="/colaborador"
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  Acesse sua área
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}