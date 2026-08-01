import {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

const WEBHOOK_CRIAR_SENHA =
  'https://n8n.saintsolution.com.br/webhook/criar-senha';

type EstadoFormulario =
  | 'FORMULARIO'
  | 'ENVIANDO'
  | 'SUCESSO'
  | 'ERRO';

type RespostaWebhook = {
  sucesso?: boolean;
  status?: string;
  mensagem?: string;
  tipo_usuario?: string;
  destino?: string;
};

function obterTokenUrl() {
  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return String(
    parametros.get('token') ?? ''
  ).trim();
}

function validarSenha(
  senha: string
) {
  if (senha.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  if (!/[A-Z]/.test(senha)) {
    return 'A senha precisa ter pelo menos uma letra maiúscula.';
  }

  if (!/[a-z]/.test(senha)) {
    return 'A senha precisa ter pelo menos uma letra minúscula.';
  }

  if (!/\d/.test(senha)) {
    return 'A senha precisa ter pelo menos um número.';
  }

  if (
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      senha
    )
  ) {
    return 'A senha precisa ter pelo menos um caractere especial.';
  }

  return '';
}

function definirDestino(
  tipoUsuario?: string,
  destinoRecebido?: string
) {
  if (destinoRecebido) {
    return destinoRecebido;
  }

  const tipo =
    String(tipoUsuario ?? '')
      .trim()
      .toUpperCase();

  if (tipo === 'ADMIN') {
    return '/admin';
  }

  if (tipo === 'ASSOCIADO') {
    return '/associado';
  }

  return '/colaborador';
}

export default function CriarSenha() {
  const token = useMemo(
    () => obterTokenUrl(),
    []
  );

  const [senha, setSenha] =
    useState('');

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState('');

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [
    estado,
    setEstado,
  ] = useState<EstadoFormulario>(
    'FORMULARIO'
  );

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  const [
    destino,
    setDestino,
  ] = useState('/colaborador');

  const tokenAusente =
    token.length < 20;

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setMensagem('');

    if (tokenAusente) {
      setEstado('ERRO');
      setMensagem(
        'O link de criação de senha é inválido ou está incompleto.'
      );
      return;
    }

    const erroSenha =
      validarSenha(senha);

    if (erroSenha) {
      setEstado('ERRO');
      setMensagem(erroSenha);
      return;
    }

    if (senha !== confirmarSenha) {
      setEstado('ERRO');
      setMensagem(
        'As senhas informadas não são iguais.'
      );
      return;
    }

    try {
      setEstado('ENVIANDO');

      const resposta = await fetch(
        WEBHOOK_CRIAR_SENHA,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            finalidade:
              'DEFINIR_SENHA',

            token,

            senha,

            enviado_em:
              new Date().toISOString(),
          }),
        }
      );

      let dados: RespostaWebhook = {};

      try {
        dados =
          (await resposta.json()) as
            RespostaWebhook;
      } catch {
        dados = {};
      }

      if (
        !resposta.ok ||
        dados.sucesso === false
      ) {
        throw new Error(
          dados.mensagem ||
            'Não foi possível criar sua senha.'
        );
      }

      setDestino(
        definirDestino(
          dados.tipo_usuario,
          dados.destino
        )
      );

      setMensagem(
        dados.mensagem ||
          'Sua senha foi criada com sucesso.'
      );

      setSenha('');
      setConfirmarSenha('');
      setEstado('SUCESSO');
    } catch (erro) {
      const textoErro =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível criar sua senha.';

      setMensagem(textoErro);
      setEstado('ERRO');
    }
  }

  if (estado === 'SUCESSO') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-7 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-black text-slate-900">
            Senha criada!
          </h1>

          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {mensagem}
          </p>

          <Link
            to={destino}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-emerald-600"
          >
            Acessar minha área
          </Link>

          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10">
        <section className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
          {/* Painel verde */}
          <div className="flex flex-col justify-between bg-emerald-500 p-8 text-white sm:p-10 lg:p-12">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Link>

              <div className="mt-14 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <KeyRound className="h-8 w-8" />
              </div>

              <h1 className="mt-6 font-display text-4xl font-black leading-tight">
                Crie sua senha de acesso
              </h1>

              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/85">
                Escolha uma senha segura para
                acessar sua área exclusiva.
              </p>
            </div>

            <div className="mt-12 space-y-4 text-sm font-semibold text-white/85">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                Seu link é pessoal e temporário.
              </div>

              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 shrink-0" />
                A senha não será armazenada de forma aberta.
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-xl">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                Acesso protegido
              </span>

              <h2 className="mt-3 font-display text-3xl font-black text-slate-900">
                Definir nova senha
              </h2>

              <p className="mt-2 text-slate-500">
                Preencha os dois campos para concluir.
              </p>

              {tokenAusente && (
                <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <p className="text-sm font-semibold">
                    Este link não possui um token válido.
                    Solicite um novo link de criação ou
                    recuperação de senha.
                  </p>
                </div>
              )}

              <form
                onSubmit={enviarFormulario}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="senha"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Nova senha
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="senha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      value={senha}
                      onChange={(evento) =>
                        setSenha(
                          evento.target.value
                        )
                      }
                      autoComplete="new-password"
                      disabled={
                        estado === 'ENVIANDO' ||
                        tokenAusente
                      }
                      placeholder="Digite sua nova senha"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenha(
                          (valor) => !valor
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        mostrarSenha
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmar-senha"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Confirmar senha
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="confirmar-senha"
                      type={
                        mostrarConfirmacao
                          ? 'text'
                          : 'password'
                      }
                      value={confirmarSenha}
                      onChange={(evento) =>
                        setConfirmarSenha(
                          evento.target.value
                        )
                      }
                      autoComplete="new-password"
                      disabled={
                        estado === 'ENVIANDO' ||
                        tokenAusente
                      }
                      placeholder="Digite a senha novamente"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          (valor) => !valor
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        mostrarConfirmacao
                          ? 'Ocultar confirmação'
                          : 'Mostrar confirmação'
                      }
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-bold text-slate-700">
                    Sua senha deve conter:
                  </p>

                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    <li>• Pelo menos 8 caracteres</li>
                    <li>• Uma letra maiúscula</li>
                    <li>• Uma letra minúscula</li>
                    <li>• Um número</li>
                    <li>• Um caractere especial</li>
                  </ul>
                </div>

                {estado === 'ERRO' && mensagem && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <p className="text-sm font-semibold">
                      {mensagem}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    estado === 'ENVIANDO' ||
                    tokenAusente
                  }
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-base font-black text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {estado === 'ENVIANDO' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Salvando senha...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      Criar minha senha
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}