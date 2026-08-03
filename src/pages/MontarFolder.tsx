import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  ArrowLeft,
  Download,
  LockKeyhole,
  Printer,
  QrCode,
  RefreshCw,
} from 'lucide-react';

import {
  QRCodeCanvas,
} from 'qrcode.react';

const DOMINIO_EMPRESAS =
  window.location.origin;
  
/*
 * Tamanho original da arte.
 *
 * As imagens devem possuir, preferencialmente:
 * 1187 x 1671 pixels.
 */
const LARGURA_FOLDER =
  1187;

const ALTURA_FOLDER =
  1671;

/*
 * Posição do QR Code na arte.
 *
 * X: distância da esquerda.
 * Y: distância do topo.
 * TAMANHO: largura e altura.
 *
 * Depois poderemos ajustar visualmente
 * para cada modelo de panfleto.
 */
const QR_X =
  827;

const QR_Y =
  1317;

const QR_TAMANHO =
  260;

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

function criarTitulo(
  caminho: string
) {
  const nomeArquivo =
    criarId(
      caminho
    );

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
  ).map(
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
  );

export function MontarFolder() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const qrCanvasRef =
    useRef<HTMLCanvasElement | null>(
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
    pronto,
    setPronto,
  ] = useState(false);

  const colaborador =
    lerColaboradorDaSessao();

  const codColab =
    normalizarCodigo(
      colaborador
        ?.cod_colab
    );

  const linkVenda =
    colaborador
      ?.link_indicacao
      ?.trim() ||
    (
      codColab
        ? `${DOMINIO_EMPRESAS}/${codColab}`
        : ''
    );

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  const modeloId =
    parametros.get(
      'modelo'
    ) || '';

  const panfleto =
    panfletos.find(
      (item) =>
        item.id ===
        modeloId
    );

  function desenharPanfleto() {
    if (!panfleto) {
      setErro(
        'O modelo de panfleto não foi encontrado.'
      );

      setCarregando(false);

      return;
    }

    if (!linkVenda) {
      setErro(
        'O link do colaborador não foi encontrado.'
      );

      setCarregando(false);

      return;
    }

    const canvas =
      canvasRef.current;

    const qrCanvas =
      qrCanvasRef.current;

    if (
      !canvas ||
      !qrCanvas
    ) {
      return;
    }

    const contexto =
      canvas.getContext(
        '2d'
      );

    if (!contexto) {
      setErro(
        'Não foi possível preparar a imagem.'
      );

      setCarregando(false);

      return;
    }

    setCarregando(true);
    setErro('');
    setPronto(false);

    const imagemBase =
      new window.Image();

    imagemBase.onload =
      () => {
        canvas.width =
          LARGURA_FOLDER;

        canvas.height =
          ALTURA_FOLDER;

        contexto.clearRect(
          0,
          0,
          LARGURA_FOLDER,
          ALTURA_FOLDER
        );

        /*
         * Desenha a imagem ocupando
         * toda a área do panfleto.
         */
        contexto.drawImage(
          imagemBase,
          0,
          0,
          LARGURA_FOLDER,
          ALTURA_FOLDER
        );

        /*
         * Fundo branco para garantir
         * a leitura do QR Code.
         */
        contexto.fillStyle =
          '#ffffff';

        contexto.fillRect(
          QR_X,
          QR_Y,
          QR_TAMANHO,
          QR_TAMANHO
        );

        /*
         * Aplica o QR Code sobre
         * a arte original.
         */
        contexto.drawImage(
          qrCanvas,
          QR_X,
          QR_Y,
          QR_TAMANHO,
          QR_TAMANHO
        );

        setCarregando(false);
        setPronto(true);
      };

    imagemBase.onerror =
      () => {
        setErro(
          'Não foi possível carregar o panfleto.'
        );

        setCarregando(false);
      };

    imagemBase.src =
      panfleto.imagem;
  }

  useEffect(() => {
    if (
      !panfleto ||
      !linkVenda
    ) {
      return;
    }

    /*
     * Pequena espera para garantir
     * que o QRCodeCanvas oculto
     * já tenha sido desenhado.
     */
    const temporizador =
      window.setTimeout(
        () => {
          desenharPanfleto();
        },
        200
      );

    return () => {
      window.clearTimeout(
        temporizador
      );
    };
  }, [
    modeloId,
    linkVenda,
  ]);

  function baixarPanfleto() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !panfleto ||
      !pronto
    ) {
      return;
    }

    const url =
      canvas.toDataURL(
        'image/png',
        1
      );

    const link =
      document.createElement(
        'a'
      );

    link.href = url;

    link.download =
      `${panfleto.id}_${codColab}.png`;

    document.body
      .appendChild(
        link
      );

    link.click();

    document.body
      .removeChild(
        link
      );
  }

  function imprimirPanfleto() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !pronto
    ) {
      return;
    }

    const imagem =
      canvas.toDataURL(
        'image/png',
        1
      );

    const janela =
      window.open(
        '',
        '_blank'
      );

    if (!janela) {
      window.alert(
        'O navegador bloqueou a janela de impressão. Permita janelas pop-up e tente novamente.'
      );

      return;
    }

    janela.document.write(`
      <!DOCTYPE html>

      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />

          <title>
            Imprimir panfleto ConsulToque
          </title>

          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              background: white;
            }

            img {
              display: block;
              width: 210mm;
              height: 297mm;
              object-fit: fill;
            }
          </style>
        </head>

        <body>
          <img
            src="${imagem}"
            alt="Panfleto ConsulToque"
            onload="window.print();"
          />
        </body>
      </html>
    `);

    janela.document.close();
  }

  /*
   * Sem sessão, volta ao login.
   */
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

          <p className="mt-3 text-slate-600">
            Entre na Área do Colaborador para gerar seu panfleto personalizado.
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

  /*
   * Modelo inexistente.
   */
  if (!panfleto) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <QrCode className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Panfleto não encontrado
          </h1>

          <p className="mt-3 text-slate-600">
            Volte ao catálogo e escolha uma das artes disponíveis.
          </p>

          <Link
            to="/panfletos-promocionais"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Escolher outro panfleto
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/*
       * QR Code oculto.
       * Este canvas será copiado
       * para a arte principal.
       */}
      <div
        aria-hidden="true"
        className="fixed -left-[9999px] top-0"
      >
        <QRCodeCanvas
          ref={qrCanvasRef}
          value={linkVenda}
          size={520}
          level="H"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

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
              Montagem do panfleto
            </p>
          </div>

          <Link
            to="/panfletos-promocionais"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Escolher outra arte
          </Link>
        </div>
      </header>

      {/* Apresentação */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-sm font-bold uppercase tracking-wider text-green-200">
            Panfleto personalizado
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {panfleto.titulo}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-blue-50">
            Seu QR Code será colocado automaticamente no espaço reservado da arte.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Prévia */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-blue-700">
                  Prévia
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Seu panfleto pronto
                </h2>
              </div>

              {pronto && (
                <span className="rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-800">
                  ✓ Personalizado
                </span>
              )}
            </div>

            {carregando && (
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-800">
                Preparando seu panfleto...
              </div>
            )}

            {erro && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
                {erro}
              </div>
            )}

            <div className="mx-auto max-w-xl rounded-xl bg-slate-100 p-2 sm:p-4">
              <canvas
                ref={canvasRef}
                className="block h-auto w-full bg-white shadow-lg"
              />
            </div>
          </section>

          {/* Controles */}
          <aside className="space-y-6 lg:sticky lg:top-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase text-green-700">
                Sua identificação
              </p>

              <p className="mt-2 text-3xl font-black">
                {codColab}
              </p>

              <p className="mt-2 break-all text-sm text-slate-600">
                {linkVenda}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">
                O que deseja fazer?
              </h2>

              <button
                type="button"
                onClick={baixarPanfleto}
                disabled={!pronto}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Download className="h-5 w-5" />
                Baixar panfleto
              </button>

              <button
                type="button"
                onClick={imprimirPanfleto}
                disabled={!pronto}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Printer className="h-5 w-5" />
                Imprimir agora
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="font-black text-amber-950">
                Confira antes de usar
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-amber-900">
                Aponte a câmera do celular para o QR Code da prévia. Confira se o endereço termina com o número{' '}
                <strong>{codColab}</strong>.
              </p>

              <button
                type="button"
                onClick={desenharPanfleto}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-950 underline"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar novamente
              </button>
            </div>
          </aside>
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

export default MontarFolder;