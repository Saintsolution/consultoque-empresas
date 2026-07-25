import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Calculator } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-mint-gradient py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

      <div className="container-app relative">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow bg-white/20 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Inscrição coletiva
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
              Monte o plano coletivo da sua empresa em minutos
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Informe o CPF do responsável, o CNPJ da empresa e adicione os
              titulares. O valor total é calculado automaticamente — com desconto
              a partir de 10 inscrições, não importa se são individuais ou
              familiares.
            </p>
            <Link
              to="/formcoletivo"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-mint-700 shadow-glow transition-all duration-300 hover:scale-[1.03]"
            >
              Acessar formulário de inscrição
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
              <Users className="h-8 w-8 text-white" />
              <p className="mt-3 font-display text-xl font-bold text-white">
                Flexível
              </p>
              <p className="mt-1 text-sm text-white/85">
                Adicione quantos titulares quiser, individuais ou familiares.
              </p>
            </div>
            <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
              <Calculator className="h-8 w-8 text-white" />
              <p className="mt-3 font-display text-xl font-bold text-white">
                Cálculo instantâneo
              </p>
              <p className="mt-1 text-sm text-white/85">
                Veja o valor total atualizar em tempo real a cada titular
                adicionado.
              </p>
            </div>
            <div className="rounded-3xl bg-white/15 p-6 backdrop-blur sm:col-span-2">
              <p className="text-sm text-white/85">
                A partir de <strong className="text-white">10 inscrições</strong>,
                o valor individual cai para R$ 30 e o familiar para R$ 60 —
                automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
