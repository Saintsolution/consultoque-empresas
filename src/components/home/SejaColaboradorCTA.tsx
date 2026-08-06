import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
} from 'lucide-react';

export default function SejaColaboradorCTA() {
  return (
    <section className="bg-white py-14">
      <div className="container-app">
        {/* Caixa azul */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-7 py-9 text-white shadow-xl sm:px-10 sm:py-11 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            
            {/* Texto */}
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Users className="h-6 w-6 text-green-300" />
                </span>

                <span className="text-sm font-bold uppercase tracking-wider text-green-300">
                  Faça parte da nossa equipe
                </span>
              </div>

              <h2 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Seja colaborador e ganhe comissões indicando a ConsulToque
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
                Compartilhe os benefícios da telemedicina, faça suas
                indicações e acompanhe seus resultados em uma área
                exclusiva.
              </p>
            </div>

            {/* Botão verde */}
            <Link
              to="/seja-colaborador"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-500 px-7 py-4 text-base font-extrabold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-green-400 hover:shadow-xl"
            >
              Quero ser colaborador

              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}