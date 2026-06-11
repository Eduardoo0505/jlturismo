import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  } catch { /* ignore */ }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacoteSelecionado");
    localStorage.removeItem("destino");
    navigate("/");
    window.location.reload();
  }

  return (
    <header className="header">
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
        <h2 style={{ margin: 0 }}>✈️ E&Y Turismo</h2>
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/">Início</Link>
        <Link to="/pacotes">Pacotes</Link>
        <Link to="/destinos">Destinos</Link>
        <Link to="/mapa">Mapa</Link>
        <Link to="/contato">Contato</Link>
        {token ? (
          <>
            <Link to="/perfil" style={{ fontWeight: "bold" }}>
              👤 {usuario?.nome?.split(" ")[0] || "Perfil"}
            </Link>
            {usuario?.role === "admin" && (
              <Link to="/admin" style={{ color: "#ffd700", fontWeight: "bold" }}>⚙️ Admin</Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" style={{ fontWeight: "bold" }}>Login</Link>
        )}
      </nav>
    </header>
  );
}