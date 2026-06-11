import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function registrarInteresseSeHouver(token) {
    const raw = localStorage.getItem("destino");
    if (!raw) return;
    let destino;
    try {
      destino = JSON.parse(raw);
    } catch {
      localStorage.removeItem("destino");
      return;
    }
    if (!destino?.id) {
      localStorage.removeItem("destino");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/interesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinoId: destino.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn("Interesse não registrado:", err);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      localStorage.removeItem("destino");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos!");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        }
        await registrarInteresseSeHouver(data.token);

        // Redireciona para a página solicitada ou home
        navigate(redirect);
      } else {
        setErro(data.erro || "Erro no login");
      }
    } catch {
      setErro("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        {erro && (
          <div style={{
            background: "rgba(255,107,107,0.15)", border: "1px solid #ff6b6b",
            borderRadius: "8px", padding: "8px 12px", color: "#ff6b6b", fontSize: "0.85rem",
          }}>{erro}</div>
        )}

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErro(""); }}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(""); }}
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p>
          Não possuo conta{" "}
          <span
          className="link"
          onClick={() => navigate(`/cadastro?redirect=${encodeURIComponent(redirect)}`)}>
            Cadastre-se
          </span>
        </p>
      </form>
    </div>
  );
}