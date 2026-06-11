// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes Globais
import Header          from './components/Header';

// Páginas existentes
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import CadastroPage    from './pages/CadastroPage';
import DestinosPage    from './pages/DestinosPage';

// Páginas existentes (atualizadas)
import MapaPage        from './pages/MapaPage';
import PacotesPage     from './pages/PacotesPage';
import PagamentoPage   from './pages/PagamentoPage';
import ContatoPage     from './pages/ContatoPage';

// Páginas novas
import PerfilPage      from './pages/PerfilPage';
import AdminPage       from './pages/AdminPage';

// Guarda de rota privada (exige login)
function RotaPrivada({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// Guarda de rota admin (exige login + role admin)
function RotaAdmin({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.role !== 'admin') return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Públicas */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/cadastro"  element={<CadastroPage />} />
        <Route path="/destinos"  element={<DestinosPage />} />
        <Route path="/pacotes"   element={<PacotesPage />} />
        <Route path="/mapa"      element={<MapaPage />} />
        <Route path="/contato"   element={<ContatoPage />} />

        {/* Privada — só acessa se estiver logado */}
        <Route
          path="/pagamento"
          element={
            <RotaPrivada>
              <PagamentoPage />
            </RotaPrivada>
          }
        />
        <Route
          path="/perfil"
          element={
            <RotaPrivada>
              <PerfilPage />
            </RotaPrivada>
          }
        />

        {/* Admin — só acessa se for admin */}
        <Route
          path="/admin"
          element={
            <RotaAdmin>
              <AdminPage />
            </RotaAdmin>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}