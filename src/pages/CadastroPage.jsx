import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    cidade: "",
    estado: "",
  });
  const navigate = useNavigate();

  async function buscarCEP(value) {
    setCep(value);
  
    if (value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();

        if (!data.erro) {
          setEndereco({
            rua: data.logradouro,
            cidade: data.localidade,
            estado: data.uf
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cpf: cpf || undefined,
          email,
          senha,
          cep: cep || undefined,
          rua: endereco.rua || undefined,
          cidade: endereco.cidade || undefined,
          estado: endereco.estado || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.erro || "Não foi possível cadastrar");
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        }
      }
      alert("Cadastro realizado! Faça login se preferir usar outra sessão.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor. O BFF está rodando em " + API_BASE_URL + "?");
    }
  }

  return (
    <div className="container">
      <form className="card" onSubmit={handleCadastro}>
        <h2>Criar uma conta</h2>

        <input
          placeholder="Nome completo"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <div className="linha">
          <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <input
          type="password"
          placeholder="Senha"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <div className="linha">
          <input
            placeholder="CEP"
            value={cep}
            onChange={(e) => buscarCEP(e.target.value)}
          />
          <input placeholder="Estado" value={endereco.estado} readOnly />
        </div>

        <input placeholder="Rua" value={endereco.rua} readOnly />
        <input placeholder="Cidade" value={endereco.cidade} readOnly />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}