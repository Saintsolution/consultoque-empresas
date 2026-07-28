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
    dias * 24 * 60 * 60;

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
      String(indicador ?? '')
        .trim();

    /*
     * Aceita somente quatro números:
     * 0001, 0002, 0015, 1380 etc.
     */
    if (/^\d{4}$/.test(codigo)) {
      salvarIndicador(codigo);
    }

    /*
     * Retira o indicador da URL
     * sem recarregar a página.
     */
    navigate('/', {
      replace: true,
    });
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
        elemento.scrollIntoView({
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
   * O formulário coletivo fica
   * em uma página exclusiva,
   * sem Header e sem Footer.
   */
  const paginaFormulario =
    location.pathname ===
    '/formcoletivo';

  if (paginaFormulario) {
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
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/formcoletivo"
            element={
              <FormColetivo />
            }
          />

          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/associado"
            element={
              <Associado />
            }
          />

          {/*
           * Entrada por link do colaborador:
           * empresas.consultoque.com.br/0007
           */}
          <Route
            path="/:indicador"
            element={
              <EntradaIndicador />
            }
          />

          <Route
            path="*"
            element={<Home />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}