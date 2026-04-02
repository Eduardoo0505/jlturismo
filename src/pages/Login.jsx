import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();
      console.log("Resposta:", data);

      if (response.ok) {
        alert("Login realizado!");
        navigate("/");
      } else {
        alert("Erro no login");
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