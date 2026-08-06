import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  {
    label: 'Início',
    href: '/',
  },
  {
    label: 'Telemedicina',
    href: '/#beneficios',
  },
  {
    label: 'Planos',
    href: '/#planos',
  },
  {
    label: 'Inscrição Coletiva',
    href: '/formcoletivo',
  },
  {
    label: 'Institucional',
    href: '/#institucional',
  },
  {
    label: 'Área do Associado',
    href: '/associado',
    acesso: true,
  },
  {
    label: 'Área do Colaborador',
    href: '/colaborador',
    acesso: true,
  },
];

export default function Header() {
  const [open, setOpen] =
    useState(false);

  return (
    <header className="relative z-50 w-full bg-white">
      {/* Banner responsivo */}
      <Link
        to="/"
        className="block w-full"
        aria-label="Voltar ao início"
        onClick={() =>
          setOpen(false)
        }
      >
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/banner_cel.png"
          />

          <img
            src="/banner_desk.png"
            alt="ConsulToque para empresas e grupos"
            className="block h-auto w-full"
          />
        </picture>
      </Link>

      {/* Faixa verde */}
      <div
        className="w-full shadow-md"
        style={{
          backgroundColor:
            '#16a34a',
        }}
      >
        <div className="mx-auto max-w-7xl px-4">
          {/* Menu desktop */}
          <nav className="header-desktop-nav">
            {navLinks.map(
              (link) => (
                <Link
                  key={
                    link.href
                  }
                  to={
                    link.href
                  }
                  className={
                    link.acesso
                      ? 'header-nav-link header-access-link'
                      : 'header-nav-link'
                  }
                >
                  {
                    link.label
                  }
                </Link>
              )
            )}
          </nav>

          {/* Controle mobile */}
          <div className="header-mobile-control">
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Menu
            </span>

            <button
              type="button"
              onClick={() =>
                setOpen(
                  (anterior) =>
                    !anterior
                )
              }
              aria-label={
                open
                  ? 'Fechar menu'
                  : 'Abrir menu'
              }
              aria-expanded={
                open
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
            >
              {open ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu aberto no celular */}
        {open && (
          <nav className="header-mobile-menu">
            {navLinks.map(
              (link) => (
                <Link
                  key={
                    link.href
                  }
                  to={
                    link.href
                  }
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className={
                    link.acesso
                      ? 'header-mobile-link header-mobile-access-link'
                      : 'header-mobile-link'
                  }
                >
                  {
                    link.label
                  }
                </Link>
              )
            )}
          </nav>
        )}
      </div>

      {/* Controle responsivo independente do Tailwind */}
      <style>
        {`
          .header-desktop-nav {
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
          }

          .header-nav-link {
            color: #ffffff;
            font-size: 13px;
            font-weight: 800;
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: 0.035em;
            text-decoration: none;
            white-space: nowrap;
            transition:
              opacity 180ms ease,
              transform 180ms ease,
              background-color 180ms ease;
          }

          .header-nav-link:hover {
            opacity: 0.82;
            transform: translateY(-1px);
          }

          /*
           * As duas áreas de acesso ficam destacadas,
           * mas continuam integradas à faixa verde.
           */
          .header-access-link {
            padding: 9px 12px;
            border: 1px solid rgba(255, 255, 255, 0.32);
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.10);
          }

          .header-access-link:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.20);
          }

          .header-mobile-control {
            min-height: 54px;
            display: none;
            align-items: center;
            justify-content: space-between;
          }

          .header-mobile-menu {
            display: none;
          }

          @media (max-width: 767px) {
            .header-desktop-nav {
              display: none;
            }

            .header-mobile-control {
              display: flex;
            }

            .header-mobile-menu {
              display: flex;
              flex-direction: column;
              padding: 8px 16px 14px;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              background-color: #15803d;
            }

            .header-mobile-link {
              padding: 13px 8px;
              color: #ffffff;
              font-size: 15px;
              font-weight: 700;
              text-decoration: none;
              border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            }

            .header-mobile-link:last-child {
              border-bottom: none;
            }

            /*
             * Destaque das áreas de acesso dentro
             * do menu sanduíche.
             */
            .header-mobile-access-link {
              margin-top: 6px;
              padding: 13px 12px;
              border: 1px solid rgba(255, 255, 255, 0.22);
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.10);
            }

            .header-mobile-access-link + .header-mobile-access-link {
              margin-top: 8px;
            }
          }
        `}
      </style>
    </header>
  );
}