import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
} from 'lucide-react';

export default function SejaColaboradorCTA() {
  return (
    <section className="bg-mint-500 py-14 text-white">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
              <Users className="h-6 w-6" />

              <span className="text-sm font-bold uppercase tracking-wider text-white/80">
                Faça parte da nossa equipe
              </span>
            </div>

            <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Seja colaborador e ganhe comissões indicando a ConsulToque
            </h2>

            <p className="mt-3 text-base leading-relaxed text-white/85">
              Compartilhe os benefícios da telemedicina, faça suas
              indicações e acompanhe seus resultados em uma área
              exclusiva.
            </p>
          </div>

          <Link
            to="/seja-colaborador"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-mint-600 shadow-lg transition-all hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl"
          >
            Quero ser colaborador

            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}