import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Mail,
  Instagram,
  Music2,
  ShieldCheck,
  Lock,
  LockKeyhole,
  Building2,
  ExternalLink,
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
          {/* Marca */}
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
                href="https://instagram.com/consultoque"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://www.tiktok.com/@consultoquereal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok da CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Music2 className="h-5 w-5" />
              </a>

              <a
                href="mailto:consultoque@gmail.com"
                aria-label="E-mail da CONSULTOQUE"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-gradient-to-br hover:from-mint-500 hover:to-brand-500"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">
              Navegação
            </h4>

            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-white/75 transition-colors hover:text-mint-400"
                >
                  Início
                </Link>
              </li>

              <li>
                <Link
                  to="/#beneficios"
                  className="text-white/75 transition-colors hover:text-mint-400"
                >
                  Telemedicina
                </Link>
              </li>

              <li>
                <Link
                  to="/#planos"
                  className="text-white/75 transition-colors hover:text-mint-400"
                >
                  Planos
                </Link>
              </li>

              <li>
                <Link
                  to="/formcoletivo"
                  className="text-white/75 transition-colors hover:text-mint-400"
                >
                  Inscrição Coletiva
                </Link>
              </li>

              <li>
                <Link
                  to="/seja-colaborador"
                  className="inline-flex items-center gap-2 font-semibold text-mint-400 transition-colors hover:text-mint-300"
                >
                  <UserPlus className="h-4 w-4" />
                  Quero ser colaborador
                </Link>
              </li>
            </ul>
          </div>

          {/* Sistema de benefícios */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">
              Sistema de Benefícios
            </h4>

            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-mint-400" />
                SIA — ConsulToque
              </li>

              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-mint-400" />
                Mais Clube de Benefícios
              </li>

              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-mint-400" />
                Direitos registrados
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-mint-400" />

                <a
                  href="mailto:consultoque@gmail.com"
                  className="transition-colors hover:text-mint-400"
                >
                  consultoque@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Áreas de acesso */}
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

        {/* Informações de confiança */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Prestadora de telemedicina */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10">
                <Building2 className="h-5 w-5 text-brand-400" />
              </div>

              <div>
                <p className="mb-1 text-xs text-white/50">
                  Prestadora dos serviços de telemedicina
                </p>

                <p className="text-sm font-semibold text-white">
                  CLICK LIFE SAÚDE LTDA
                </p>

                <p className="mt-1 text-xs text-white/60">
                  CNPJ/MF nº 39.549.271/0001-36
                </p>
              </div>
            </div>

            {/* HTTPS */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-500/10">
                <LockKeyhole className="h-5 w-5 text-mint-400" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Ambiente protegido
                </p>

                <p className="mt-1 text-xs text-white/60">
                  Conexão segura por HTTPS
                </p>
              </div>
            </div>

            {/* Reclame Aqui */}
            <a
              href="https://www.reclameaqui.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Acessar o site Reclame Aqui"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition-all hover:border-brand-400/60 hover:bg-white/10 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                <ExternalLink className="h-5 w-5 text-purple-400" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-white transition-colors group-hover:text-brand-300">
                  Reclame Aqui
                </p>

                <p className="mt-1 text-xs text-white/60">
                  Consulte empresas e reputações
                </p>
              </div>

              <ExternalLink className="h-4 w-4 text-white/30 transition-colors group-hover:text-brand-400" />
            </a>
          </div>
        </div>

        {/* Direitos e termos */}
        <div className="mt-8 border-t border-white/10 pt-6">
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