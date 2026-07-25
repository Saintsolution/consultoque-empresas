import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
} from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 text-white"
      style={{
        minHeight: '720px',

        paddingTop:
          '110px',

        paddingBottom:
          '190px',

        background:
          'linear-gradient(135deg, #2563eb 0%, #4b9cf6 52%, #22c1dc 100%)',
      }}
    >
      {/* Luz superior direita */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: '420px',
          height: '420px',
          right: '-130px',
          top: '-150px',

          backgroundColor:
            'rgba(255, 255, 255, 0.16)',
        }}
      />

      {/* Luz inferior esquerda */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          left: '-160px',
          bottom: '-110px',

          backgroundColor:
            'rgba(30, 64, 175, 0.24)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          {/* Aviso de desconto */}
          <div
            className="inline-flex items-center gap-2 border px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg backdrop-blur"
            style={{
              marginBottom:
                '34px',

              borderRadius:
                '12px',

              borderColor:
                'rgba(255, 255, 255, 0.32)',

              backgroundColor:
                'rgba(255, 255, 255, 0.16)',
            }}
          >
            <BadgePercent className="h-5 w-5" />

            A partir de 10 vidas,
            planos com desconto
          </div>

          {/* Título */}
          <h1
            className="font-black tracking-tight text-white"
            style={{
              fontSize:
                'clamp(40px, 5vw, 68px)',

              lineHeight:
                '1.08',
            }}
          >
            Saúde para sua empresa,
            igreja, associação ou
            grupo
          </h1>

          {/* Texto principal */}
          <p
            className="mx-auto max-w-3xl font-semibold text-white/90"
            style={{
              marginTop:
                '30px',

              fontSize:
                'clamp(19px, 2vw, 26px)',

              lineHeight:
                '1.5',
            }}
          >
            Telemedicina 24 horas
            para cuidar das pessoas
            que fazem parte da sua
            organização.
          </p>

          {/* Texto complementar */}
          <p
            className="mx-auto max-w-2xl text-white/85"
            style={{
              marginTop:
                '18px',

              fontSize:
                'clamp(16px, 1.5vw, 19px)',

              lineHeight:
                '1.65',
            }}
          >
            Atendimento médico
            online, sem filas e sem
            carência, com condições
            especiais para planos
            coletivos.
          </p>

          {/* Botão principal */}
          <div
            className="flex justify-center"
            style={{
              marginTop:
                '46px',
            }}
          >
            <Link
              to="/formcoletivo"
              className="hero-main-button group inline-flex items-center justify-center gap-4 border text-xl font-black text-white"
            >
              Montar meu plano
              coletivo

              <ArrowRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Frase inferior */}
          <p
            className="font-semibold text-white/80"
            style={{
              marginTop:
                '34px',

              fontSize:
                '15px',
            }}
          >
            Simples, acessível e
            pensado para grupos de
            todos os tamanhos.
          </p>
        </div>
      </div>

      {/* Caimento branco:
          começa alto à esquerda
          e termina baixo à direita */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 leading-none">
        <svg
          viewBox="0 0 1440 170"
          preserveAspectRatio="none"
          style={{
            display: 'block',
            width: '100%',
            height: '170px',
          }}
          aria-hidden="true"
        >
          <path
            d="
              M 0 30
              C 330 105,
                720 90,
                1000 100
              C 1170 105,
                1310 130,
                1440 150
              L 1440 170
              L 0 170
              Z
            "
            fill="#ffffff"
          />
        </svg>
      </div>

      <style>
        {`
          .hero-main-button {
            min-width: 350px;
            min-height: 72px;
            padding: 18px 34px;
            border-radius: 12px;
            border-color: rgba(134, 239, 172, 0.75);
            background: linear-gradient(
              180deg,
              #22c55e 0%,
              #16a34a 100%
            );
            box-shadow:
              0 8px 0 #117236,
              0 18px 32px rgba(0, 0, 0, 0.25);
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              filter 180ms ease;
          }

          .hero-main-button:hover {
            transform: translateY(-3px);
            filter: brightness(1.04);
            box-shadow:
              0 11px 0 #117236,
              0 22px 38px rgba(0, 0, 0, 0.27);
          }

          .hero-main-button:active {
            transform: translateY(5px);
            box-shadow:
              0 3px 0 #117236,
              0 10px 20px rgba(0, 0, 0, 0.22);
          }

          @media (max-width: 767px) {
            .hero-main-button {
              width: 100%;
              min-width: 0;
              min-height: 64px;
              padding: 16px 22px;
              font-size: 17px;
            }
          }
        `}
      </style>
    </section>
  );
}