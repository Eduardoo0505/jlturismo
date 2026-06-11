import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

const ESTADOS_BRASILEIROS = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

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
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // Aplica a máscara de CPF em tempo real (123.456.789-01)
  function aplicarMascaraCPF(value) {
    const apenasDigitos = value.replace(/\D/g, "");
    const limitado = apenasDigitos.slice(0, 11);
    if (limitado.length <= 3) {
      return limitado;
    } else if (limitado.length <= 6) {
      return `${limitado.slice(0, 3)}.${limitado.slice(3)}`;
    } else if (limitado.length <= 9) {
      return `${limitado.slice(0, 3)}.${limitado.slice(3, 6)}.${limitado.slice(6)}`;
    } else {
      return `${limitado.slice(0, 3)}.${limitado.slice(3, 6)}.${limitado.slice(6, 9)}-${limitado.slice(9)}`;
    }
  }

  // Aplica a máscara de CEP em tempo real (12345-678)
  function aplicarMascaraCEP(value) {
    const apenasDigitos = value.replace(/\D/g, "");
    const limitado = apenasDigitos.slice(0, 8);
    if (limitado.length <= 5) {
      return limitado;
    } else {
      return `${limitado.slice(0, 5)}-${limitado.slice(5)}`;
    }
  }

  async function buscarCEP(value) {
    const cepComMascara = aplicarMascaraCEP(value);
    setCep(cepComMascara);
  
    const apenasDigitos = cepComMascara.replace(/\D/g, "");
    if (apenasDigitos.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${apenasDigitos}/json/`);
        const data = await res.json();

        if (!data.erro) {
          setEndereco({
            rua: data.logradouro || "",
            cidade: data.localidade || "",
            estado: data.uf || ""
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

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

  async function handleCadastro(e) {
    e.preventDefault();
    try {
      // Remove a máscara do CPF para enviar apenas os 11 dígitos numéricos exigidos pela validação do BFF
      const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : undefined;
      // Remove a máscara do CEP para manter o padrão sem caracteres especiais se preferir
      const cepLimpo = cep ? cep.replace(/\D/g, "") : undefined;

      const res = await fetch(`${API_BASE_URL}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cpf: cpfLimpo || undefined,
          email,
          senha,
          cep: cepLimpo || undefined,
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
        await registrarInteresseSeHouver(data.token);
        alert("Cadastro realizado com sucesso! Você já está logado.");
        navigate(redirect);
      } else {
        alert("Cadastro realizado! Faça login se preferir usar outra sessão.");
        navigate("/login");
      }
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
          <input
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(aplicarMascaraCPF(e.target.value))}
          />
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
          <select
            required
            value={endereco.estado || ""}
            onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
            style={{ flex: 1 }}
          >
            <option value="" disabled style={{ color: "#000" }}>Estado</option>
            {ESTADOS_BRASILEIROS.map((e) => (
              <option key={e.uf} value={e.uf} style={{ color: "#000" }}>
                {e.uf} - {e.nome}
              </option>
            ))}
          </select>
        </div>

        <input
          placeholder="Rua"
          value={endereco.rua}
          onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
        />
        <input
          placeholder="Cidade"
          value={endereco.cidade}
          onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
        />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}