import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Mail,
  Instagram,
  Music2,
  ShieldCheck,
  Lock,
  UserCog,
  User,
  Users,
  UserPlus,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="font-display text-xl font-extrabold">
                  CONSULTOQUE
                </p>

                <p className="text-xs text-white/60">
                  Consulta num toque
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Telemedicina 24 horas por dia. Consultas imediatas,
              receitas e atestados digitais aceitos, com o respaldo
              da legislação brasileira.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="TikTok CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Music2 className="h-5 w-5" />
              </a>

              <a
                href="mailto:consultoque@gmail.com"
                aria-label="E-mail CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">
              Navegação
            </h4>

            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-white/75 hover:text-mint-400"
                >
                  Início
                </Link>
              </li>

              <li>
                <Link
                  to="/#beneficios"
                  className="text-white/75 hover:text-mint-400"
                >
                  Telemedicina
                </Link>
              </li>

              <li>
                <Link
                  to="/#planos"
                  className="text-white/75 hover:text-mint-400"
                >
                  Planos
                </Link>
              </li>

              <li>
                <Link
                  to="/formcoletivo"
                  className="text-white/75 hover:text-mint-400"
                >
                  Inscrição Coletiva
                </Link>
              </li>

              <li>
                <Link
                  to="/seja-colaborador"
                  className="inline-flex items-center gap-2 font-semibold text-mint-400 hover:text-mint-300"
                >
                  <UserPlus className="h-4 w-4" />
                  Quero ser colaborador
                </Link>
              </li>
            </ul>
          </div>

          {/* Benefits system */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">
              Sistema de Benefícios
            </h4>

            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-mint-400" />
                SIA - Consultoque
              </li>

              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-mint-400" />
                Mais Clube de Benefícios
              </li>

              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-mint-400" />
                Direitos registrados
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-mint-400" />
                consultoque@gmail.com
              </li>
            </ul>
          </div>

          {/* Access areas */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">
              Áreas de acesso
            </h4>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/associado"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-brand-400/60 hover:bg-white/10"
              >
                <User className="h-4 w-4 text-brand-400" />
                Área do Associado
              </Link>

              <Link
                to="/colaborador"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-mint-400/60 hover:bg-white/10"
              >
                <Users className="h-4 w-4 text-mint-400" />
                Área do Colaborador
              </Link>

              <Link
                to="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10"
              >
                <UserCog className="h-4 w-4 text-white/70" />
                Área Administrativa
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-white/50 sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()} CONSULTOQUE — Consulta num
              toque. Todos os direitos reservados.
            </p>

            <p>
              Ao enviar formulários de inscrição, você concorda com os{' '}
              <span className="text-white/70">
                Termos de Adesão
              </span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}