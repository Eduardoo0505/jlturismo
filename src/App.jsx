// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas EXISTENTES — ajuste os caminhos conforme seus arquivos reais
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import CadastroPage    from './pages/CadastroPage';
import DestinosPage    from './pages/DestinosPage';

// Páginas NOVAS
import MapaPage        from './pages/MapaPage';
import PacotesPage     from './pages/PacotesPage';
import PagamentoPage   from './pages/PagamentoPage';
import ContatoPage     from './pages/ContatoPage';

// Guarda de rota privada (exige login)
function RotaPrivada({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}