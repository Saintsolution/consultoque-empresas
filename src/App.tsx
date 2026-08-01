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

import Associado from '@/pages/Associado';
import AssociadoPage from '@/pages/AssociadoPage';
import AssociadoDashboard from '@/pages/AssociadoDashboard';

import Colaborador from '@/pages/Colaborador';
import ColaboradorDashboard from '@/pages/ColaboradorDashboard';
import SejaColaborador from '@/pages/SejaColaborador';

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

    /*
     * Aceita somente quatro números:
     * 0001, 0002, 0015, 1380 etc.
     */
    if (
      /^\d{4}$/.test(
        codigo
      )
    ) {
      salvarIndicador(
        codigo
      );
    }

    /*
     * Retira o indicador da URL
     * sem recarregar a página.
     */
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
      }

      return;
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

  /*
   * Estas páginas são exclusivas:
   * não exibem Header nem Footer.
   */
  const paginaExclusiva = [
    '/formcoletivo',
    '/seja-colaborador',
  ].includes(
    location.pathname
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

          {/*
           * Associado:
           * inscrição, acesso
           * e dashboard.
           */}
          <Route
            path="/associado/inscricao"
            element={
              <Associado />
            }
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

          {/*
           * Colaborador:
           * inscrição, acesso
           * e dashboard.
           */}
          <Route
            path="/seja-colaborador"
            element={
              <SejaColaborador />
            }
          />

          <Route
            path="/colaborador"
            element={
              <Colaborador />
            }
          />

          <Route
            path="/colaborador/dashboard"
            element={
              <ColaboradorDashboard />
            }
          />

          {/*
           * Esta rota precisa ficar
           * depois de todas as rotas
           * com nomes.
           *
           * Exemplo:
           * empresas.consultoque.com.br/0007
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