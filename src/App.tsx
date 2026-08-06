import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  useEffect,
} from 'react';

import type {
  ReactNode,
} from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import Home from '@/pages/Home';
import FormColetivo from '@/pages/FormColetivo';
import Admin from '@/pages/Admin';

import AssociadoPage from '@/pages/AssociadoPage';
import AssociadoDashboard from '@/pages/AssociadoDashboard';

import Colaborador from '@/pages/Colaborador';
import ColaboradorDashboard from '@/pages/ColaboradorDashboard';
import SejaColaborador from '@/pages/SejaColaborador';
import CriarSenha from '@/pages/CriarSenha';

import MaterialPromocional from '@/pages/MaterialPromocional';
import PanfletosPromocionais from '@/pages/PanfletosPromocionais';
import MontarFolder from '@/pages/MontarFolder';
import Play from '@/pages/Play';

const CHAVE_INDICADOR =
  'indicador_colab';

const COOKIE_INDICADOR =
  'indicador_colab';

function salvarIndicador(
  indicador: string
) {
  localStorage.setItem(
    CHAVE_INDICADOR,
    indicador
  );

  const dias = 30;

  const segundos =
    dias *
    24 *
    60 *
    60;

  document.cookie =
    `${COOKIE_INDICADOR}=${indicador}; ` +
    `Max-Age=${segundos}; ` +
    'Path=/; ' +
    'SameSite=Lax; ' +
    'Secure';
}

function EntradaIndicador() {
  const {
    indicador,
  } = useParams();

  const navigate =
    useNavigate();

  useEffect(() => {
    const codigo =
      String(
        indicador ?? ''
      ).trim();

    if (
      /^\d{4}$/.test(
        codigo
      )
    ) {
      salvarIndicador(
        codigo
      );
    }

    navigate(
      '/',
      {
        replace: true,
      }
    );
  }, [
    indicador,
    navigate,
  ]);

  return <Home />;
}

function ScrollToHash() {
  const {
    hash,
    pathname,
  } = useLocation();

  useEffect(() => {
    if (hash) {
      const elemento =
        document.querySelector(
          hash
        );

      if (elemento) {
        elemento
          .scrollIntoView({
            behavior: 'smooth',
          });

        return;
      }
    }

    window.scrollTo({
      top: 0,
    });
  }, [
    hash,
    pathname,
  ]);

  return null;
}

type LayoutProps = {
  children: ReactNode;
};

function Layout({
  children,
}: LayoutProps) {
  const location =
    useLocation();

  const caminho =
    location.pathname;

  /*
   * Estas páginas possuem
   * tela e navegação próprias.
   *
   * Portanto, não exibem
   * Header nem Footer gerais.
   */
  const paginasExclusivas = [
  '/formcoletivo',
  '/seja-colaborador',
  '/criar-senha',

  '/associado',
  '/associado/inscricao',
  '/associado/dashboard',

  '/colaborador',
  '/colaborador/dashboard',

  '/admin',

  '/material-promocional',
  '/panfletos-promocionais',
  '/montar-folder',
];

  const paginaExclusiva =
    paginasExclusivas.includes(
      caminho
    ) ||
    caminho.startsWith(
      '/play/'
    );

  if (paginaExclusiva) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />

      <Layout>
        <Routes>
          {/* Página inicial */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Inscrição coletiva */}
          <Route
            path="/formcoletivo"
            element={
              <FormColetivo />
            }
          />

          {/* Área administrativa */}
          <Route
            path="/admin"
            element={<Admin />}
          
          />

          <Route
            path="/associado"
            element={
              <AssociadoPage />
            }
          />

          <Route
            path="/associado/dashboard"
            element={
              <AssociadoDashboard />
            }
          />

          {/* Cadastro do colaborador */}
          <Route
            path="/seja-colaborador"
            element={
              <SejaColaborador />
            }
          />

          {/* Login do colaborador */}
          <Route
            path="/colaborador"
            element={
              <Colaborador />
            }
          />

          {/* Dashboard do colaborador */}
          <Route
            path="/colaborador/dashboard"
            element={
              <ColaboradorDashboard />
            }
          />

          {/* Material promocional */}
          <Route
            path="/material-promocional"
            element={
              <MaterialPromocional />
            }
          />

          {/* Catálogo de panfletos */}
          <Route
            path="/panfletos-promocionais"
            element={
              <PanfletosPromocionais />
            }
          />

          {/* Montagem do panfleto */}
          <Route
            path="/montar-folder"
            element={
              <MontarFolder />
            }
          />

          {/*
           * Vídeo com número
           * do colaborador.
           *
           * Exemplo:
           * /play/crianca-noite/0003
           */}
          <Route
            path="/play/:video/:ref"
            element={
              <Play />
            }
          />

          {/*
           * Vídeo com referência
           * já guardada no navegador.
           *
           * Exemplo:
           * /play/crianca-noite
           */}
          <Route
            path="/play/:video"
            element={
              <Play />
            }
          />

          {/* Criação e recuperação de senha */}
          <Route
            path="/criar-senha"
            element={
              <CriarSenha />
            }
          />

          {/*
           * Entrada pelo código
           * do colaborador.
           *
           * Exemplo:
           * /0003
           */}
          <Route
            path="/:indicador"
            element={
              <EntradaIndicador />
            }
          />

          {/* Rota inexistente */}
          <Route
            path="*"
            element={<Home />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}