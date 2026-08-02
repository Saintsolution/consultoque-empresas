import {
  useRef,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  Play,
  Printer,
  QrCode,
} from 'lucide-react';

import {
  QRCodeSVG,
} from 'qrcode.react';

const DOMINIO_EMPRESAS =
  'https://empresas.consultoque.com.br';

const LINK_TEXTOS =
  'https://drive.google.com/drive/folders/1pjk7eKKBeAavOw_7-0i8BW-ad0ymoKTj?usp=drive_link';

const LINK_MATERIAL_IMPRESSO =
  'https://drive.google.com/drive/folders/1qkwIorYxgoIhFYFfrMfvq5y2ogrX8rlr?usp=drive_link';

const VIDEOS_PROMOCIONAIS = [
  {
    slug: 'crianca-noite',

    titulo:
      'Criança durante a noite',

    descricao:
      'Uma família encontra atendimento médico para o filho durante a madrugada.',

    formato:
      'Vertical',

    downloadUrl:
      'https://drive.google.com/uc?export=download&id=1u3CSFoxl6w0KcsmcNvIJYAasTVln7rlA',
  },

  {
    slug:
      'morena-tiktok',

    titulo:
      'Morena TikTok',

    descricao:
      'Vídeo curto e direto, preparado para compartilhamento nas redes sociais.',

    formato:
      'Vertical',

    downloadUrl:
      'https://drive.google.com/uc?export=download&id=1EID5HcVRURnGoR5BNVDABOkP6R1JUBoo',
  },

  {
    slug:
      'japones-doente',

    titulo:
      'Japonês doente',

    descricao:
      'Campanha mostrando uma situação cotidiana e a solução ConsulToque.',

    formato:
      'Vertical',

    downloadUrl:
      'https://drive.google.com/uc?export=download&id=1w6OJJxxe94DRBnVo5APOYX4oiQV2fpY2',
  },

  {
    slug:
      'medico-explica',

    titulo:
      'Médico explica',

    descricao:
      'Um médico explica de maneira simples como funciona o atendimento.',

    formato:
      'Horizontal',

    downloadUrl:
      'https://drive.google.com/uc?export=download&id=1Ntfir61CIPVm-3PO9KD1T14WH5hwIyTG',
  },
] as const;

type ColaboradorSessao = {
  cod_colab?: string;
  nome_colab?: string;
  link_indicacao?: string;
};

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

export function MaterialPromocional() {
  const qrCodeRef =
    useRef<SVGSVGElement | null>(
      null
    );

  const [
    copiado,
    setCopiado,
  ] = useState(false);

  const [
    videoCopiado,
    setVideoCopiado,
  ] = useState<string | null>(
    null
  );

  const [
    colaborador,
  ] = useState(
    () => lerColaboradorDaSessao()
  );

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

  /*
   * Se o n8n já retornou o link
   * de indicação, podemos utilizá-lo.
   * Caso contrário, montamos com
   * o domínio do site Empresas.
   */
  const linkVenda =
    colaborador
      ?.link_indicacao
      ?.trim() ||
    (
      codColab
        ? `${DOMINIO_EMPRESAS}/${codColab}`
        : ''
    );

  async function copiarTexto(
    texto: string
  ) {
    try {
      await navigator
        .clipboard
        .writeText(texto);

      return true;
    } catch {
      window.prompt(
        'Copie o endereço:',
        texto
      );

      return false;
    }
  }

  async function copiarLink() {
    if (!linkVenda) {
      return;
    }

    await copiarTexto(
      linkVenda
    );

    setCopiado(true);

    window.setTimeout(
      () => {
        setCopiado(false);
      },
      2500
    );
  }

  function compartilharWhatsApp() {
    if (!linkVenda) {
      return;
    }

    const mensagem = [
      'Olá! Quero apresentar a você a ConsulToque.',
      'Conheça nossos planos de telemedicina e benefícios:',
      linkVenda,
    ].join('\n\n');

    const url =
      `https://wa.me/?text=${encodeURIComponent(
        mensagem
      )}`;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function criarLinkVideo(
    slug: string
  ) {
    if (!codColab) {
      return '';
    }

    return (
      `${DOMINIO_EMPRESAS}` +
      `/play/${slug}/${codColab}`
    );
  }

  async function copiarLinkVideo(
    slug: string
  ) {
    const link =
      criarLinkVideo(
        slug
      );

    if (!link) {
      return;
    }

    await copiarTexto(
      link
    );

    setVideoCopiado(
      slug
    );

    window.setTimeout(
      () => {
        setVideoCopiado(
          (valorAtual) =>
            valorAtual === slug
              ? null
              : valorAtual
        );
      },
      2500
    );
  }

  function compartilharVideoWhatsApp(
    slug: string,
    titulo: string
  ) {
    const link =
      criarLinkVideo(
        slug
      );

    if (!link) {
      return;
    }

    const mensagem = [
      `Assista a este vídeo da ConsulToque: ${titulo}`,
      link,
    ].join('\n\n');

    const url =
      `https://wa.me/?text=${encodeURIComponent(
        mensagem
      )}`;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function baixarVideo(
    downloadUrl: string,
    titulo: string
  ) {
    const confirmou =
      window.confirm(
        [
          `Você vai baixar o vídeo “${titulo}”.`,
          '',
          'O arquivo MP4 não contém seu número de colaborador.',
          'Ao publicar ou enviar o vídeo, coloque junto o seu link:',
          linkVenda,
          '',
          'Deseja continuar?',
        ].join('\n')
      );

    if (!confirmou) {
      return;
    }

    window.open(
      downloadUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function baixarQRCode() {
    const svg =
      qrCodeRef.current;

    if (
      !svg ||
      !codColab
    ) {
      return;
    }

    const copia =
      svg.cloneNode(
        true
      ) as SVGSVGElement;

    copia.setAttribute(
      'xmlns',
      'http://www.w3.org/2000/svg'
    );

    const conteudo =
      new XMLSerializer()
        .serializeToString(
          copia
        );

    const arquivo =
      new Blob(
        [conteudo],
        {
          type:
            'image/svg+xml;charset=utf-8',
        }
      );

    const url =
      URL.createObjectURL(
        arquivo
      );

    const link =
      document.createElement(
        'a'
      );

    link.href = url;

    link.download =
      `qrcode-consultoque-empresas-${codColab}.svg`;

    document.body
      .appendChild(
        link
      );

    link.click();

    document.body
      .removeChild(
        link
      );

    URL.revokeObjectURL(
      url
    );
  }

  if (
    !colaborador ||
    !codColab ||
    !linkVenda
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <QrCode className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Entre na Área do Colaborador
          </h1>

          <p className="mt-3 leading-relaxed text-slate-600">
            Para visualizar seu link, QR Code e materiais promocionais, primeiro faça o login.
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
              Apoio ao colaborador
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/colaborador/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>

            <Link
              to="/"
              className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Início do site
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Apresentação */}
        <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <p className="text-sm font-bold uppercase tracking-wider text-green-200">
              Área de divulgação
            </p>

            <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Material Promocional e Dicas de Venda
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-50">
              Olá, <strong>{nomeColab}</strong>! Aqui estão seus materiais e links personalizados para divulgar a ConsulToque.
            </p>
          </div>
        </section>

        {/* Link e QR Code */}
        <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
              <div className="p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">
                  Seus dados de divulgação
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Este é o seu link exclusivo
                </h2>

                <p className="mt-3 leading-relaxed text-slate-600">
                  O número no final identifica que o novo associado chegou por sua indicação.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[150px_1fr]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Seu número
                    </p>

                    <p className="mt-1 text-3xl font-black text-green-600">
                      {codColab}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase text-blue-700">
                      Seu link de indicação
                    </p>

                    <a
                      href={linkVenda}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block break-all font-black text-blue-800 hover:underline"
                    >
                      {linkVenda}
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex flex-col flex-wrap gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={copiarLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-5 w-5" />
                        Link copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copiar meu link
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={compartilharWhatsApp}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Enviar pelo WhatsApp
                  </button>

                  <a
                    href={linkVenda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-black"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Abrir meu link
                  </a>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-bold text-amber-950">
                    Atenção
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-amber-900">
                    Não retire o número <strong>{codColab}</strong> do endereço. Sem ele, o sistema não identificará sua indicação.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-t border-slate-200 bg-slate-50 p-6 text-center sm:p-8 lg:border-l lg:border-t-0">
                <p className="font-black">
                  Seu QR Code
                </p>

                <p className="mb-5 mt-1 text-sm text-slate-500">
                  Ele abre seu link exclusivo.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    ref={qrCodeRef}
                    value={linkVenda}
                    size={190}
                    level="H"
                    marginSize={1}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    title={`QR Code do colaborador ${codColab}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={baixarQRCode}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  <Download className="h-5 w-5" />
                  Baixar meu QR Code
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vídeos */}
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wider text-blue-700">
            Vídeos com sua indicação
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Escolha um vídeo e envie seu link
          </h2>

          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
            Os links já contêm seu número. Quando a pessoa assistir e clicar em “Saiba mais”, sua indicação continuará registrada.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {VIDEOS_PROMOCIONAIS.map(
              (video) => {
                const linkVideo =
                  criarLinkVideo(
                    video.slug
                  );

                const foiCopiado =
                  videoCopiado ===
                  video.slug;

                return (
                  <article
                    key={video.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 p-6 text-white">
                      <Play className="h-10 w-10" />

                      <p className="mt-5 text-xs font-black uppercase tracking-wider text-green-200">
                        {video.formato}
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        {video.titulo}
                      </h3>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-sm leading-relaxed text-slate-600">
                        {video.descricao}
                      </p>

                      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-500">
                          Link deste vídeo
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-blue-800">
                          {linkVideo}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-2">
                        <a
                          href={linkVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white hover:bg-black"
                        >
                          Assistir ao vídeo
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            compartilharVideoWhatsApp(
                              video.slug,
                              video.titulo
                            )
                          }
                          className="rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                        >
                          Enviar pelo WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            copiarLinkVideo(
                              video.slug
                            )
                          }
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-800 hover:bg-blue-100"
                        >
                          {foiCopiado
                            ? '✓ Link copiado!'
                            : 'Copiar link do vídeo'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            baixarVideo(
                              video.downloadUrl,
                              video.titulo
                            )
                          }
                          className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800"
                        >
                          Baixar vídeo
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* Outros materiais */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wider text-green-700">
            Outros materiais
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Escolha como divulgar
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <FileText className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Textos para WhatsApp e e-mail
              </h3>

              <p className="mt-3 leading-relaxed text-slate-600">
                Mensagens prontas para copiar, personalizar e enviar aos seus contatos.
              </p>

              <a
                href={LINK_TEXTOS}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
              >
                <ExternalLink className="h-5 w-5" />
                Abrir textos
              </a>
            </article>

            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Printer className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Panfletos personalizados
              </h3>

              <p className="mt-3 leading-relaxed text-slate-600">
                Escolha uma arte e aplique automaticamente o QR Code com sua indicação.
              </p>

              <Link
                to="/panfletos-promocionais"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                <QrCode className="h-5 w-5" />
                Escolher meu panfleto
              </Link>

              <a
                href={LINK_MATERIAL_IMPRESSO}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-center text-sm font-bold text-blue-700 hover:underline"
              >
                Ver arquivos originais no Drive
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-400 sm:px-6">
          © {new Date().getFullYear()} ConsulToque. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export default MaterialPromocional;