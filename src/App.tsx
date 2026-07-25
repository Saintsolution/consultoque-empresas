import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
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

          <Route
            path="*"
            element={<Home />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}