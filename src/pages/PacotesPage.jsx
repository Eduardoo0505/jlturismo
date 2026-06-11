// src/pages/PacotesPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

export default function PacotesPage() {
  const navigate   = useNavigate();
  const isLogado   = !!localStorage.getItem('token');
  const [pacotes, setPacotes]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]           = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API_BASE_URL}/destinos`);
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        setPacotes(Array.isArray(data) ? data : []);
      } catch {
        setErro('Não foi possível carregar os pacotes. Verifique se o backend está rodando.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function escolherPacote(pacote) {
    localStorage.setItem('pacoteSelecionado', JSON.stringify({
      id: pacote.id,
      nome: pacote.nome,
      descricao: pacote.descricao,
      preco: pacote.precoNumero,
      destino: pacote.nome,
      duracao: '',
    }));
    if (isLogado) {
      navigate('/pagamento');
    } else {
      navigate('/login?redirect=/pagamento');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
        padding: '3rem 2rem', textAlign: 'center',
        borderBottom: '1px solid #333',
      }}>
        <h1 style={{ color: '#37d4af', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🌍 Nossos Pacotes
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
          Escolha o destino dos seus sonhos e deixe o resto com a gente
        </p>
      </div>

      {/* Loading / Erro */}
      {carregando && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Carregando pacotes...
        </div>
      )}
      {erro && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>{erro}</div>
      )}

      {/* Grid de pacotes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        padding: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {pacotes.map((p, index) => (
          <div key={p.id} style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            border: index === 0 ? '2px solid #37d4af' : '1px solid #333',
            overflow: 'hidden',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(55,212,175,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {index === 0 && (
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: '#37d4af', color: '#000',
                fontSize: '0.7rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                ⭐ MAIS VENDIDO
              </div>
            )}
            {/* Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1a2a2a, #252525)',
              height: '120px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem',
            }}>
              🌎
            </div>
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ color: '#37d4af', margin: '0 0 0.25rem', fontSize: '1.2rem' }}>
                {p.nome}
              </h3>
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem' }}>
                {p.descricao}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#37d4af', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {p.preco}
                </span>
                <button
                  onClick={() => escolherPacote(p)}
                  style={{
                    background: '#37d4af', color: '#000', border: 'none',
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2bc49f'}
                  onMouseOut={(e) => e.target.style.background = '#37d4af'}
                >
                  Escolher
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}