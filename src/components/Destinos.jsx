import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

export default function Destinos() {
  const navigate = useNavigate();
  const [ativo, setAtivo] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const res = await fetch(`${API_BASE_URL}/destinos`);
        if (!res.ok) throw new Error("Falha ao carregar destinos");
        const data = await res.json();
        console.log("DADOS:", data);
        if (!cancelado) setDestinos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!cancelado) {
          setErro("Não foi possível carregar os pacotes. Verifique se o BFF está rodando.");
          setDestinos([]);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

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

      {carregando && <p className="destinos-status">Carregando pacotes…</p>}
      {erro && <p className="destinos-status">{erro}</p>}

      <div className="cards">
        {destinos.map((d) => (
          <div className="card" key={d.id}>
            <h3>{d.nome}</h3>
            <p>{d.preco}</p>

            <button type="button" onClick={() => toggle(d.id)}>
              Ver mais detalhes
            </button>

            <button type="button" onClick={() => escolherDestino(d)}>
              Escolher pacote
            </button>

            {ativo === d.id && <p className="descricao">{d.descricao}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
