import {
  Link,
} from 'react-router-dom';

import {
  ArrowLeft,
  Image,
  LockKeyhole,
  QrCode,
} from 'lucide-react';

const DOMINIO_EMPRESAS =
  'https://empresas.consultoque.com.br';

const arquivos =
  import.meta.glob(
    '../assets/panfletos/folder_*.{png,jpg,jpeg,webp}',
    {
      eager: true,
      import: 'default',
    }
  ) as Record<string, string>;

type Panfleto = {
  id: string;
  titulo: string;
  imagem: string;
};

type ColaboradorSessao = {
  cod_colab?: string;
  nome_colab?: string;
  link_indicacao?: string;
};

function criarTitulo(
  caminho: string
) {
  const nomeArquivo =
    caminho
      .split('/')
      .pop()
      ?.replace(
        /\.(png|jpg|jpeg|webp)$/i,
        ''
      ) || '';

  return nomeArquivo
    .replace(
      /^folder_/,
      ''
    )
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /\b\w/g,
      (letra) =>
        letra.toUpperCase()
    );
}

function criarId(
  caminho: string
) {
  return (
    caminho
      .split('/')
      .pop()
      ?.replace(
        /\.(png|jpg|jpeg|webp)$/i,
        ''
      ) || ''
  );
}

function normalizarCodigo(
  valor: unknown
) {
  const numeros =
    String(valor ?? '')
      .replace(/\D/g, '');

  if (
    numeros.length < 1 ||
    numeros.length > 4
  ) {
    return '';
  }

  return numeros.padStart(
    4,
    '0'
  );
}

function lerColaboradorDaSessao():
  ColaboradorSessao | null {
  const sessao =
    sessionStorage.getItem(
      'colaborador'
    );

  if (!sessao) {
    return null;
  }

  try {
    const dados =
      JSON.parse(
        sessao
      ) as ColaboradorSessao;

    if (
      !normalizarCodigo(
        dados.cod_colab
      )
    ) {
      return null;
    }

    return dados;
  } catch {
    return null;
  }
}

const panfletos:
  Panfleto[] =
  Object.entries(
    arquivos
  )
    .map(
      ([
        caminho,
        imagem,
      ]) => ({
        id:
          criarId(
            caminho
          ),

        titulo:
          criarTitulo(
            caminho
          ),

        imagem,
      })
    )
    .sort(
      (a, b) =>
        a.titulo.localeCompare(
          b.titulo,
          'pt-BR'
        )
    );

export function PanfletosPromocionais() {
  const colaborador =
    lerColaboradorDaSessao();

  const codColab =
    normalizarCodigo(
      colaborador
        ?.cod_colab
    );

  const nomeColab =
    colaborador
      ?.nome_colab
      ?.trim() ||
    'Colaborador';

  const linkVenda =
    colaborador
      ?.link_indicacao
      ?.trim() ||
    (
      codColab
        ? `${DOMINIO_EMPRESAS}/${codColab}`
        : ''
    );

  if (
    !colaborador ||
    !codColab ||
    !linkVenda
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <LockKeyhole className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Faça login para continuar
          </h1>

          <p className="mt-3 leading-relaxed text-slate-600">
            Para escolher um panfleto personalizado, primeiro entre na sua Área do Colaborador.
          </p>

          <Link
            to="/colaborador"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Ir para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Cabeçalho exclusivo */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link
              to="/"
              className="text-2xl font-black tracking-tight"
            >
              <span className="text-blue-700">
                CONSUL
              </span>

              <span className="text-green-600">
                TOQUE
              </span>
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              Panfletos personalizados
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/material-promocional"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Material promocional
            </Link>

            <Link
              to="/colaborador/dashboard"
              className="px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Minha área
            </Link>
          </div>
        </div>
      </header>

      {/* Apresentação */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-sm font-bold uppercase tracking-wider text-green-200">
            Material impresso
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">
            Escolha seu panfleto
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-50">
            Olá, <strong>{nomeColab}</strong>! Escolha uma das artes abaixo. O sistema colocará automaticamente o QR Code com o seu link de indicação.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Identificação */}
        <div className="mb-10 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-blue-700">
                Sua identificação
              </p>

              <p className="mt-1 text-slate-600">
                O QR Code será criado para o colaborador:{' '}
                <strong className="text-slate-900">
                  {codColab}
                </strong>
              </p>
            </div>

            <div className="break-all rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-800">
              {linkVenda}
            </div>
          </div>
        </div>

        {panfletos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Image className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Nenhum panfleto encontrado
            </h2>

            <p className="mt-3 text-slate-600">
              Coloque pelo menos uma imagem cujo nome comece com{' '}
              <strong>folder_</strong> nesta pasta:
            </p>

            <code className="mt-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-slate-800">
              src/assets/panfletos
            </code>

            <p className="mt-4 text-sm text-slate-500">
              Exemplo: folder_banner_33_reais.png
            </p>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <p className="text-sm font-bold uppercase text-green-700">
                {panfletos.length}{' '}
                {panfletos.length === 1
                  ? 'modelo disponível'
                  : 'modelos disponíveis'}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Modelos de panfleto
              </h2>

              <p className="mt-2 text-slate-600">
                Clique na arte desejada para visualizar seu QR Code aplicado antes de baixar ou imprimir.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {panfletos.map(
                (panfleto) => (
                  <article
                    key={panfleto.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="bg-slate-100 p-4">
                      <div className="aspect-[1187/1671] overflow-hidden rounded-xl bg-white shadow-sm">
                        <img
                          src={
                            panfleto.imagem
                          }
                          alt={
                            panfleto.titulo
                          }
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-black uppercase text-green-700">
                        Panfleto ConsulToque
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        {panfleto.titulo}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Personalize esta arte com seu QR Code de indicação.
                      </p>

                      <Link
                        to={
                          `/montar-folder?modelo=${encodeURIComponent(
                            panfleto.id
                          )}`
                        }
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800"
                      >
                        <QrCode className="h-5 w-5" />
                        Visualizar e personalizar
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          </>
        )}

        {/* Aviso */}
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-black text-amber-950">
            Antes de imprimir
          </h2>

          <p className="mt-2 leading-relaxed text-amber-900">
            Depois de personalizar o panfleto, teste o QR Code com a câmera do celular. Confira se ele abre o site da ConsulToque com o número{' '}
            <strong>{codColab}</strong> no final do endereço.
          </p>
        </div>
      </main>

      <footer className="mt-8 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-400 sm:px-6">
          © {new Date().getFullYear()} ConsulToque. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export default PanfletosPromocionais;