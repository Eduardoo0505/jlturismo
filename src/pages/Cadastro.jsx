import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    cidade: "",
    estado: ""
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

  function handleCadastro(e) {
    e.preventDefault();
    alert("Cadastro realizado!");
    setTimeout(() => {
  navigate("/login");
}, 1000);
  }

  return (
    <div className="container">
      <form className="card" onSubmit={handleCadastro}>
        <h2>Criar uma conta</h2>

        <input placeholder="Nome completo" required />

        <div className="linha">
          <input placeholder="CPF" required />
          <input placeholder="Email" required />
        </div>

        <input type="password" placeholder="Senha" required />

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