import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BadgePercent,
  Check,
  Users,
} from 'lucide-react';

const features = [
  'Consulta imediata 24h',

  '11 especialidades médicas',

  '1 atendimento com psicanalista por mês',

  '1 atendimento com personal trainer por mês',

  '1 atendimento com nutricionista por mês',

  'Receitas e atestados digitais',

  'Mistura de diferentes tipos de inscrição',

  'Inclusão individual de cada titular por CPF',

  'Desconto automático a partir de 10 vidas',

  'Acesso à rede de benefícios com descontos',
];

export default function Pricing() {
  return (
    <section
      id="planos"
      className="px-4 py-16 md:py-20"
      style={{
        backgroundColor:
          '#f5f9ff',
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Título */}
        <div className="text-center">
          <span
            className="text-xs font-black uppercase tracking-[0.22em]"
            style={{
              color: '#2563eb',
            }}
          >
            Plano coletivo
          </span>

          <h2
            className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-4xl"
            style={{
              color: '#0f172a',
            }}
          >
            Monte o plano ideal para
            sua organização
          </h2>
        </div>

        {/* Card principal */}
        <div
          className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border bg-white"
          style={{
            borderColor:
              '#dbeafe',

            boxShadow:
              '0 20px 55px rgba(15, 23, 42, 0.12)',
          }}
        >
          {/* Faixa superior */}
          <div
            className="px-6 py-5 text-center text-white md:px-10"
            style={{
              background:
                'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #22c1dc 100%)',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6" />

              <h3 className="text-xl font-black md:text-2xl">
                Você escolhe a
                quantidade e a
                composição do grupo
              </h3>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Duas opções de valor */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Valor de R$ 33 */}
              <div
                className="relative overflow-hidden rounded-2xl border bg-white p-6 text-center"
                style={{
                  borderColor:
                    '#bfdbfe',

                  boxShadow:
                    '0 8px 22px rgba(37, 99, 235, 0.09)',
                }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wide"
                  style={{
                    color:
                      '#2563eb',
                  }}
                >
                  Uma vida
                </p>

                <div className="mt-3 flex items-end justify-center gap-1">
                  <span
                    className="mb-2 text-base font-bold"
                    style={{
                      color:
                        '#64748b',
                    }}
                  >
                    R$
                  </span>

                  <span
                    className="text-5xl font-black"
                    style={{
                      color:
                        '#0f172a',
                    }}
                  >
                    33
                  </span>

                  <span
                    className="mb-2 text-sm font-semibold"
                    style={{
                      color:
                        '#64748b',
                    }}
                  >
                    /mês
                  </span>
                </div>

                <div
                  className="mx-auto mt-5 max-w-xs rounded-xl px-4 py-3"
                  style={{
                    backgroundColor:
                      '#f0fdf4',
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color:
                        '#15803d',
                    }}
                  >
                    Com 10 vidas ou
                    mais
                  </p>

                  <p
                    className="mt-1 text-2xl font-black"
                    style={{
                      color:
                        '#16a34a',
                    }}
                  >
                    R$ 30
                    <span className="ml-1 text-sm font-bold">
                      /mês
                    </span>
                  </p>
                </div>
              </div>

              {/* Valor de R$ 66 */}
              <div
                className="relative overflow-hidden rounded-2xl border bg-white p-6 text-center"
                style={{
                  borderColor:
                    '#bbf7d0',

                  boxShadow:
                    '0 8px 22px rgba(22, 163, 74, 0.09)',
                }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wide"
                  style={{
                    color:
                      '#16a34a',
                  }}
                >
                  Uma vida e até
                  três dependentes
                </p>

                <div className="mt-3 flex items-end justify-center gap-1">
                  <span
                    className="mb-2 text-base font-bold"
                    style={{
                      color:
                        '#64748b',
                    }}
                  >
                    R$
                  </span>

                  <span
                    className="text-5xl font-black"
                    style={{
                      color:
                        '#0f172a',
                    }}
                  >
                    66
                  </span>

                  <span
                    className="mb-2 text-sm font-semibold"
                    style={{
                      color:
                        '#64748b',
                    }}
                  >
                    /mês
                  </span>
                </div>

                <div
                  className="mx-auto mt-5 max-w-xs rounded-xl px-4 py-3"
                  style={{
                    backgroundColor:
                      '#f0fdf4',
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color:
                        '#15803d',
                    }}
                  >
                    Com 10 vidas ou
                    mais
                  </p>

                  <p
                    className="mt-1 text-2xl font-black"
                    style={{
                      color:
                        '#16a34a',
                    }}
                  >
                    R$ 60
                    <span className="ml-1 text-sm font-bold">
                      /mês
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Aviso de desconto */}
            <div
              className="mt-6 flex items-start gap-3 rounded-2xl border px-5 py-4"
              style={{
                borderColor:
                  '#bbf7d0',

                backgroundColor:
                  '#f0fdf4',
              }}
            >
              <BadgePercent
                className="mt-0.5 h-6 w-6 shrink-0"
                style={{
                  color:
                    '#16a34a',
                }}
              />

              <p
                className="text-sm font-semibold leading-relaxed"
                style={{
                  color:
                    '#166534',
                }}
              >
                Ao alcançar 10 vidas,
                os valores passam
                automaticamente de
                R$ 33 para R$ 30 e
                de R$ 66 para R$ 60.
                Você pode combinar
                livremente as duas
                opções.
              </p>
            </div>

            {/* Lista de benefícios */}
            <div className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {features.map(
                (feature) => (
                  <div
                    key={
                      feature
                    }
                    className="flex items-start gap-3"
                  >
                    <div
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          '#dcfce7',

                        color:
                          '#16a34a',
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>

                    <span
                      className="text-sm font-semibold leading-relaxed"
                      style={{
                        color:
                          '#334155',
                      }}
                    >
                      {
                        feature
                      }
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Botão único */}
            <div className="mt-9 flex justify-center">
              <Link
                to="/formcoletivo"
                className="pricing-main-button group inline-flex items-center justify-center gap-3 text-lg font-black text-white"
              >
                Monte seu plano

                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Observação inferior */}
        <p
          className="mx-auto mt-7 max-w-3xl text-center text-sm font-semibold leading-relaxed"
          style={{
            color: '#64748b',
          }}
        >
          Os valores são mensais.
          Qualquer combinação das
          opções conta para atingir
          as 10 vidas e liberar
          automaticamente os preços
          reduzidos.
        </p>
      </div>

      <style>
        {`
          .pricing-main-button {
            min-width: 310px;
            min-height: 62px;
            padding: 16px 32px;
            border-radius: 12px;
            background: linear-gradient(
              180deg,
              #22c55e 0%,
              #16a34a 100%
            );
            box-shadow:
              0 7px 0 #117236,
              0 15px 28px rgba(15, 23, 42, 0.22);
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              filter 180ms ease;
          }

          .pricing-main-button:hover {
            transform: translateY(-3px);
            filter: brightness(1.04);
            box-shadow:
              0 10px 0 #117236,
              0 19px 34px rgba(15, 23, 42, 0.24);
          }

          .pricing-main-button:active {
            transform: translateY(4px);
            box-shadow:
              0 3px 0 #117236,
              0 9px 18px rgba(15, 23, 42, 0.2);
          }

          @media (max-width: 480px) {
            .pricing-main-button {
              width: 100%;
              min-width: 0;
            }
          }
        `}
      </style>
    </section>
  );
}