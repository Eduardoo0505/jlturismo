// src/pages/PacotesPage.jsx
import { useNavigate } from 'react-router-dom';

const PACOTES = [
  {
    id: 1,
    nome: 'Pacote Aventura',
    destino: 'Bonito - MS',
    duracao: '5 dias / 4 noites',
    preco: 2490,
    descricao: 'Flutuação, trilhas e contato puro com a natureza. Inclui hospedagem e café da manhã.',
    emoji: '',
    destaque: false,
  },
  {
    id: 2,
    nome: 'Pacote Litoral',
    destino: 'Florianópolis - SC',
    duracao: '7 dias / 6 noites',
    preco: 3890,
    descricao: 'Praias paradisíacas, gastronomia e passeios de barco. O melhor do litoral sul.',
    emoji: '',
    destaque: true,
  },
  {
    id: 3,
    nome: 'Pacote Cultural',
    destino: 'Salvador - BA',
    duracao: '6 dias / 5 noites',
    preco: 3190,
    descricao: 'Pelourinho, Bonfim, culinária baiana e shows de música ao vivo.',
    emoji: '',
    destaque: false,
  },
  {
    id: 4,
    nome: 'Pacote Cataratas',
    destino: 'Foz do Iguaçu - PR',
    duracao: '4 dias / 3 noites',
    preco: 2190,
    descricao: 'Uma das 7 maravilhas naturais do mundo. Visita às cataratas e lado argentino.',
    emoji: '',
    destaque: false,
  },
  {
    id: 5,
    nome: 'Pacote Premium Serra',
    destino: 'Gramado - RS',
    duracao: '5 dias / 4 noites',
    preco: 4290,
    descricao: 'Chocolates, fondue, Snowland e a magia europeia da serra gaúcha.',
    emoji: '',
    destaque: false,
  },
  {
    id: 6,
    nome: 'Pacote Nordeste',
    destino: 'Jericoacoara - CE',
    duracao: '7 dias / 6 noites',
    preco: 4890,
    descricao: 'Lagoa do Paraíso, dunas, kitesurf e pôr do sol premiado do mundo.',
    emoji: '',
    destaque: false,
  },
];

export default function PacotesPage() {
  const navigate   = useNavigate();
  const isLogado   = !!localStorage.getItem('token');

  function escolherPacote(pacote) {
    // Salva pacote escolhido e redireciona
    localStorage.setItem('pacoteSelecionado', JSON.stringify(pacote));
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
           Nossos Pacotes
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
          Escolha o destino dos seus sonhos e deixe o resto com a gente
        </p>
      </div>

      {/* Grid de pacotes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        padding: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {PACOTES.map((p) => (
          <div key={p.id} style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            border: p.destaque ? '2px solid #37d4af' : '1px solid #333',
            overflow: 'hidden',
            position: 'relative',
            transition: 'transform 0.2s',
          }}>
            {p.destaque && (
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: '#37d4af', color: '#000',
                fontSize: '0.7rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                 MAIS VENDIDO
              </div>
            )}
            {/* Imagem/Emoji banner */}
            <div style={{
              background: '#252525', height: '120px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem',
            }}>
              {p.emoji}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ color: '#37d4af', margin: '0 0 0.25rem', fontSize: '1.2rem' }}>
                {p.nome}
              </h3>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                 {p.destino} &nbsp;·&nbsp;  {p.duracao}
              </p>
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem' }}>
                {p.descricao}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#37d4af', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  R$ {p.preco.toLocaleString('pt-BR')}
                </span>
                <button
                  onClick={() => escolherPacote(p)}
                  style={{
                    background: '#37d4af', color: '#000', border: 'none',
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                  }}
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