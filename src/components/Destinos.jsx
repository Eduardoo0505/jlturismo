import { useState } from "react";
import { useNavigate } from "react-router-dom";

const destinos = [
  { id: 1, nome: "Praia", descricao: "Pra fazer aquela marquinha ou virar camarão", preco: "R$ 1.000,00" },
  { id: 2, nome: "Serrinha", descricao: "Pra ficar vendo morro com neblina", preco: "R$ 800,00" },
  { id: 3, nome: "Beto Carrero - Passaporte 1 dia", descricao: "Chamar o hugo na Star Mountain", preco: "R$ 160,00" },
  { id: 4, nome: "Beto Carrero - Passaporte 2 dia", descricao: "Chamar o hugo por dois dias na Star Mountain", preco: "R$ 240,00" },
  { id: 5, nome: "Internacional", descricao: "Comprinhas no Paraguai...", preco: "R$ 5.000,00" },
];

export default function Destinos() {
  const navigate = useNavigate();
  const [ativo, setAtivo] = useState(null);

  function toggle(id) {
    setAtivo(ativo === id ? null : id);
  }

  function escolherDestino(destino) {
    localStorage.setItem("destino", JSON.stringify(destino));
    navigate("/login");
  }

  return (
    <section id="destinos" className="destinos">
      <h2>Nossos Destinos</h2>

      <div className="cards">
        {destinos.map((d) => (
          <div className="card" key={d.id}>
            <h3>{d.nome}</h3>
            <p>{d.preco}</p>

            <button onClick={() => toggle(d.id)}>
              Ver mais detalhes
            </button>

            <button onClick={() => escolherDestino(d)}>
              Escolher pacote
            </button>

            {ativo === d.id && (
              <p className="descricao">{d.descricao}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}