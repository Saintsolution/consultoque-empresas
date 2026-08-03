import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

import {
  ArrowRight,
  Play as PlayIcon,
} from 'lucide-react';

type FormatoVideo =
  | 'vertical'
  | 'horizontal'
  | 'quadrado';

type VideoConfig = {
  titulo: string;
  wistiaId: string;
  formato: FormatoVideo;
  aspectRatio: string;
};

type WistiaVideoApi = {
  time: () => number;
  duration: () => number;
  play: () => Promise<void> | void;

  bind: (
    evento: string,
    callback: (
      ...args: unknown[]
    ) => void
  ) => void;

  unbind: (
    evento: string,
    callback: (
      ...args: unknown[]
    ) => void
  ) => void;
};

type WistiaQueueItem = {
  id: string;

  options: {
    autoPlay: boolean;
    playerColor: string;
    videoFoam: boolean;
  };

  onReady: (
    video:
      WistiaVideoApi
  ) => void;
};

type WistiaWindow = {
  _wq?: WistiaQueueItem[];
};

const CHAVE_INDICADOR =
  'indicador_colab';

const COOKIE_INDICADOR =
  'indicador_colab';

const SEGUNDOS_ANTES_DO_FIM =
  7;

const videosPromocionais:
  Record<string, VideoConfig> = {
    'crianca-noite': {
      titulo:
        'Criança durante a noite',

      wistiaId:
        'bc1abxofrt',

      formato:
        'vertical',

      aspectRatio:
        '9/16',
    },

    'morena-tiktok': {
      titulo:
        'Morena TikTok',

      wistiaId:
        'waaunlm911',

      formato:
        'vertical',

      aspectRatio:
        '9/16',
    },
     'crianca-noite-sem-preco': {
      titulo:
        'Criança Noite sem Preço',

      wistiaId:
        'rxuqw4g4k8',

      formato:
        'vertical',

      aspectRatio:
        '9/16',
    },

    'japones-doente': {
      titulo:
        'Japonês doente',

      wistiaId:
        'efxptifhnp',

      formato:
        'vertical',

      aspectRatio:
        '9/16',
    },

    'medico-explica': {
      titulo:
        'Médico explica',

      wistiaId:
        '6a7aa410u4',

      formato:
        'horizontal',

      aspectRatio:
        '16/9',
    },
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

function salvarIndicador(
  codigo: string
) {
  localStorage.setItem(
    CHAVE_INDICADOR,
    codigo
  );

  /*
   * Mantemos também a chave antiga
   * durante a transição.
   */
  localStorage.setItem(
    'referenciador_id',
    codigo
  );

  const segundos =
    60 *
    60 *
    24 *
    30;

  document.cookie =
    `${COOKIE_INDICADOR}=${encodeURIComponent(
      codigo
    )}; ` +
    `Max-Age=${segundos}; ` +
    'Path=/; ' +
    'SameSite=Lax; ' +
    'Secure';

  /*
   * Cookie antigo mantido
   * temporariamente por compatibilidade.
   */
  document.cookie =
    `referenciador_id=${encodeURIComponent(
      codigo
    )}; ` +
    `Max-Age=${segundos}; ` +
    'Path=/; ' +
    'SameSite=Lax; ' +
    'Secure';
}

export function Play() {
  const {
    video: nomeVideo,
    ref,
  } = useParams<{
    video: string;
    ref?: string;
  }>();

  const [
    mostrarBotao,
    setMostrarBotao,
  ] = useState(false);

  const [
    videoPronto,
    setVideoPronto,
  ] = useState(false);

  const videoSelecionado =
    nomeVideo
      ? videosPromocionais[
          nomeVideo
        ]
      : undefined;

  const wistiaId =
    videoSelecionado
      ?.wistiaId;

  /*
   * Captura e guarda o número
   * do colaborador.
   *
   * Link recebido:
   * /play/crianca-noite/0003
   *
   * Depois, a barra mostra:
   * /play/crianca-noite
   */
  useEffect(() => {
    const codigoDoLink =
      normalizarCodigo(
        ref
      );

    const codigoSalvo =
      normalizarCodigo(
        localStorage.getItem(
          CHAVE_INDICADOR
        )
      );

    const codigo =
      codigoDoLink ||
      codigoSalvo ||
      '0001';

    salvarIndicador(
      codigo
    );

    /*
     * Esconde o número da URL,
     * mas não recarrega a página.
     */
    if (
      ref &&
      nomeVideo
    ) {
      window.history
        .replaceState(
          {},
          '',
          `/play/${nomeVideo}`
        );
    }
  }, [
    ref,
    nomeVideo,
  ]);

  /*
   * Carrega e controla
   * o vídeo da Wistia.
   */
  useEffect(() => {
    if (!wistiaId) {
      return;
    }

    let api:
      | WistiaVideoApi
      | undefined;

    let cancelado =
      false;

    setMostrarBotao(false);
    setVideoPronto(false);

    document
      .documentElement
      .style
      .backgroundColor =
      'black';

    document.body
      .style
      .backgroundColor =
      'black';

    document.body
      .style
      .overflowY =
      'auto';

    function verificarTempo() {
      if (!api) {
        return;
      }

      const tempoAtual =
        Number(
          api.time()
        );

      const duracao =
        Number(
          api.duration()
        );

      if (
        !Number.isFinite(
          tempoAtual
        ) ||
        !Number.isFinite(
          duracao
        ) ||
        duracao <= 0
      ) {
        return;
      }

      const tempoRestante =
        duracao -
        tempoAtual;

      if (
        tempoRestante <=
        SEGUNDOS_ANTES_DO_FIM
      ) {
        setMostrarBotao(
          true
        );
      }
    }

    function terminouVideo() {
      setMostrarBotao(
        true
      );
    }

    const wistiaWindow =
      window as unknown as
        WistiaWindow;

    wistiaWindow._wq =
      wistiaWindow._wq ||
      [];

    wistiaWindow._wq.push({
      id:
        wistiaId,

      options: {
        autoPlay:
          true,

        playerColor:
          '2566af',

        videoFoam:
          true,
      },

      onReady: (
        videoWistia
      ) => {
        if (cancelado) {
          return;
        }

        api =
          videoWistia;

        setVideoPronto(
          true
        );

        api.bind(
          'secondchange',
          verificarTempo
        );

        api.bind(
          'end',
          terminouVideo
        );

        verificarTempo();

        /*
         * Tenta iniciar
         * automaticamente.
         */
        try {
          const resultado =
            api.play();

          if (
            resultado &&
            typeof resultado.catch ===
              'function'
          ) {
            resultado.catch(
              () => undefined
            );
          }
        } catch {
          /*
           * Alguns navegadores
           * bloqueiam autoplay.
           * O usuário ainda poderá
           * iniciar pelo player.
           */
        }
      },
    });

    /*
     * Script específico
     * do vídeo.
     */
    const seletorVideo =
      `script[data-wistia-media="${wistiaId}"]`;

    let scriptVideo =
      document
        .querySelector<HTMLScriptElement>(
          seletorVideo
        );

    if (!scriptVideo) {
      scriptVideo =
        document.createElement(
          'script'
        );

      scriptVideo.src =
        `https://fast.wistia.com/embed/medias/${wistiaId}.jsonp`;

      scriptVideo.async =
        true;

      scriptVideo.dataset
        .wistiaMedia =
        wistiaId;

      document.body
        .appendChild(
          scriptVideo
        );
    }

    /*
     * Script principal
     * da Wistia.
     */
    const seletorPrincipal =
      'script[data-wistia-principal="true"]';

    let scriptPrincipal =
      document
        .querySelector<HTMLScriptElement>(
          seletorPrincipal
        );

    if (!scriptPrincipal) {
      scriptPrincipal =
        document.createElement(
          'script'
        );

      scriptPrincipal.src =
        'https://fast.wistia.com/assets/external/E-v1.js';

      scriptPrincipal.async =
        true;

      scriptPrincipal.dataset
        .wistiaPrincipal =
        'true';

      document.body
        .appendChild(
          scriptPrincipal
        );
    }

    return () => {
      cancelado =
        true;

      if (api) {
        api.unbind(
          'secondchange',
          verificarTempo
        );

        api.unbind(
          'end',
          terminouVideo
        );
      }

      document
        .documentElement
        .style
        .backgroundColor =
        '';

      document.body
        .style
        .backgroundColor =
        '';

      document.body
        .style
        .overflowY =
        '';
    };
  }, [
    wistiaId,
  ]);

  /*
   * A referência permanece
   * guardada no navegador.
   */
  function irParaOSite() {
    window.location.href =
      '/';
  }

  /*
   * Vídeo inexistente.
   */
  if (
    !videoSelecionado ||
    !wistiaId
  ) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-6 text-center">
        <h1 className="text-2xl font-bold text-white">
          Vídeo não encontrado
        </h1>

        <button
          type="button"
          onClick={irParaOSite}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Ir para o site

          <ArrowRight className="h-5 w-5" />
        </button>
      </main>
    );
  }

  let larguraContainer =
    'max-w-lg md:max-w-xl lg:max-w-2xl';

  if (
    videoSelecionado
      .formato ===
    'horizontal'
  ) {
    larguraContainer =
      'max-w-5xl';
  }

  if (
    videoSelecionado
      .formato ===
    'quadrado'
  ) {
    larguraContainer =
      'max-w-2xl';
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-black pb-20 pt-8">
      <div
        className={`relative w-[95%] ${larguraContainer} shadow-2xl`}
      >
        <div
          className="relative bg-black"
          style={{
            width:
              '100%',

            aspectRatio:
              videoSelecionado
                .aspectRatio,
          }}
        >
          <div
            key={
              wistiaId
            }
            className={
              `wistia_embed ` +
              `wistia_async_${wistiaId} ` +
              'videoFoam=true'
            }
            style={{
              position:
                'absolute',

              inset:
                0,

              width:
                '100%',

              height:
                '100%',
            }}
          />
        </div>

               {mostrarBotao && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 z-50 flex justify-center px-4">
            <button
              type="button"
              onClick={irParaOSite}
              className="pointer-events-auto flex animate-pulse items-center gap-3 rounded-full bg-blue-600 px-7 py-3.5 text-lg font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-blue-700"
            >
              <PlayIcon
                size={24}
                fill="white"
              />

              Saiba mais

              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        )}

        {!videoPronto && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
            <div className="animate-pulse text-xl text-white">
              Carregando...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Play;