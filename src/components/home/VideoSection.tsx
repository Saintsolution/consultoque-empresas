import { useState } from 'react';

import {
  Sparkles,
  Volume2,
} from 'lucide-react';

export default function VideoSection() {
  const [
    somAtivado,
    setSomAtivado,
  ] = useState(false);

  const videoUrl = somAtivado
    ? 'https://fast.wistia.net/embed/iframe/6a7aa410u4?seo=false&videoFoam=true&autoPlay=true&muted=false&controlsVisibleOnLoad=false'
    : 'https://fast.wistia.net/embed/iframe/6a7aa410u4?seo=false&videoFoam=true&autoPlay=true&muted=true&controlsVisibleOnLoad=false';

  return (
    <section
      id="institucional"
      className="bg-white py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Título */}
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]"
            style={{
              color: '#2563eb',
            }}
          >
            <Sparkles className="h-4 w-4" />

            Institucional
          </span>

          <h2
            className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
            style={{
              color: '#0f172a',
            }}
          >
            Conheça a CONSULTOQUE
          </h2>

          <p
            className="mt-2 text-lg font-bold"
            style={{
              color: '#16a34a',
            }}
          >
            Consulta num toque
          </p>
        </div>

        {/* Player Wistia */}
        <div className="mx-auto mt-9 max-w-4xl">
          <div
            className="group relative aspect-video overflow-hidden rounded-2xl border bg-black"
            style={{
              borderColor:
                '#dbeafe',

              boxShadow:
                '0 18px 45px rgba(15, 23, 42, 0.18)',
            }}
          >
            <iframe
              key={
                somAtivado
                  ? 'com-som'
                  : 'sem-som'
              }
              src={videoUrl}
              title="Conheça a CONSULTOQUE"
              allow="autoplay; fullscreen"
              frameBorder="0"
              scrolling="no"
              className="absolute inset-0 h-full w-full"
            />

            {/* Comando para ativar o áudio */}
            {!somAtivado && (
              <button
                type="button"
                onClick={() =>
                  setSomAtivado(true)
                }
                className="video-sound-button absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 border text-white backdrop-blur"
                aria-label="Ativar som do vídeo"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600">
                  <Volume2 className="h-6 w-6" />
                </span>

                <span className="text-left">
                  <strong className="block text-base font-black">
                    Ativar som
                  </strong>

                  <small className="block text-xs font-semibold text-white/80">
                    Clique para ouvir
                  </small>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .video-sound-button {
            min-width: 190px;
            padding: 10px 18px 10px 10px;
            border-radius: 14px;
            border-color: rgba(255, 255, 255, 0.4);
            background-color: rgba(15, 23, 42, 0.82);
            box-shadow:
              0 8px 0 rgba(15, 23, 42, 0.45),
              0 18px 35px rgba(0, 0, 0, 0.35);
            transition:
              transform 180ms ease,
              background-color 180ms ease,
              box-shadow 180ms ease;
          }

          .video-sound-button:hover {
            transform:
              translate(-50%, calc(-50% - 3px));
            background-color:
              rgba(37, 99, 235, 0.92);
            box-shadow:
              0 11px 0 rgba(30, 64, 175, 0.5),
              0 22px 40px rgba(0, 0, 0, 0.38);
          }

          .video-sound-button:active {
            transform:
              translate(-50%, calc(-50% + 4px));
            box-shadow:
              0 3px 0 rgba(15, 23, 42, 0.45),
              0 10px 20px rgba(0, 0, 0, 0.3);
          }

          @media (max-width: 480px) {
            .video-sound-button {
              min-width: 170px;
              padding:
                8px 14px 8px 8px;
            }
          }
        `}
      </style>
    </section>
  );
}