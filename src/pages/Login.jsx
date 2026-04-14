import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

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

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      console.log("Resposta:", data);

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        }
        await registrarInteresseSeHouver(data.token);
        alert("Login realizado!");
        navigate("/");
      } else {
        alert(data.erro || "Erro no login");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com servidor");
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">Entrar</button>

        <p>
          Não possuo conta{" "}
          <span 
          className="link"
          onClick={() => navigate("/cadastro")}>
            Cadastre-se
          </span>
        </p>
      </form>
    </div>
  );
}