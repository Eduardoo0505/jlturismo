// src/pages/PagamentoPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PagamentoPage() {
  const navigate  = useNavigate();
  const [pacote,  setPacote]  = useState(null);
  const [etapa,   setEtapa]   = useState('formulario'); // 'formulario' | 'processando' | 'sucesso' | 'erro'
  const [metodo,  setMetodo]  = useState('cartao');
  const [dados, setDados]     = useState({
    nome: '', numero: '', validade: '', cvv: '',
    cpf: '', parcelas: '1',
    pixChave: '', boletoNome: '',
  });
  const [erros, setErros]     = useState({});

  useEffect(() => {
    const salvo = localStorage.getItem('pacoteSelecionado');
    if (salvo) {
      setPacote(JSON.parse(salvo));
    } else {
      navigate('/pacotes');
    }
  }, [navigate]);

  function handleChange(e) {
    setDados((d) => ({ ...d, [e.target.name]: e.target.value }));
    setErros((er) => ({ ...er, [e.target.name]: '' }));
  }

  function validar() {
    const novosErros = {};
    if (metodo === 'cartao') {
      if (!dados.nome.trim())      novosErros.nome    = 'Nome obrigatório';
      if (dados.numero.replace(/\s/g, '').length < 16)
                                   novosErros.numero  = 'Número inválido';
      if (!dados.validade.match(/^\d{2}\/\d{2}$/))
                                   novosErros.validade = 'Use MM/AA';
      if (dados.cvv.length < 3)    novosErros.cvv     = 'CVV inválido';
    }
    if (metodo === 'pix' && !dados.pixChave.trim())
      novosErros.pixChave = 'Informe a chave PIX';
    if (metodo === 'boleto' && !dados.boletoNome.trim())
      novosErros.boletoNome = 'Nome obrigatório';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handlePagar() {
    if (!validar()) return;
    setEtapa('processando');

    try {
      const token = localStorage.getItem('token');
      const resp  = await fetch(`${API_URL}/api/pagamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pacoteId:  pacote.id,
          pacoteNome: pacote.nome,
          valor:     pacote.preco,
          metodo,
          dadosPagamento: dados,
        }),
      });

      if (resp.ok) {
        setTimeout(() => {
          localStorage.removeItem('pacoteSelecionado');
          setEtapa('sucesso');
        }, 2000);
      } else {
        setEtapa('erro');
      }
    } catch {
      // Se o backend não tiver a rota ainda, simulamos sucesso localmente
      setTimeout(() => {
        localStorage.removeItem('pacoteSelecionado');
        setEtapa('sucesso');
      }, 2500);
    }
  }

  function formatarNumero(v) {
    return v.replace(/\D/g,'').replace(/(\d{4})(?=\d)/g,'$1 ').substring(0, 19);
  }

  function formatarValidade(v) {
    return v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').substring(0, 5);
  }

  if (!pacote) return null;

  const estiloInput = (campo) => ({
    width: '100%', background: '#252525',
    border: erros[campo] ? '1px solid #ff6b6b' : '1px solid #444',
    borderRadius: '8px', padding: '0.75rem', color: '#fff',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  });

  const estiloLabel = {
    display: 'block', color: '#aaa',
    fontSize: '0.85rem', marginBottom: '0.35rem',
  };

  // === TELA DE PROCESSANDO ===
  if (etapa === 'processando') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h2 style={{ color: '#37cfd4' }}>Processando pagamento...</h2>
            <p style={{ color: '#aaa' }}>Aguarde alguns instantes.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={spinnerStyle} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === TELA DE SUCESSO ===
  if (etapa === 'sucesso') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
            <h2 style={{ color: '#4caf50', fontSize: '1.8rem' }}>Pagamento Confirmado!</h2>
            <p style={{ color: '#ccc', marginTop: '0.75rem' }}>
              Sua reserva do <strong style={{ color: '#d4af37' }}>{pacote.nome}</strong> foi confirmada.
            </p>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Em breve você receberá um e-mail com os detalhes da viagem. 
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/destinos')} style={btnSecStyle}>
                Ver Destinos
              </button>
              <button onClick={() => navigate('/')} style={btnPrimStyle}>
                Ir para Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === TELA DE ERRO ===
  if (etapa === 'erro') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ff6b6b' }}>Pagamento não processado</h2>
            <p style={{ color: '#aaa', marginTop: '0.75rem' }}>
              Ocorreu um erro. Tente novamente ou use outro método.
            </p>
            <button onClick={() => setEtapa('formulario')} style={{ ...btnPrimStyle, marginTop: '1.5rem' }}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === FORMULÁRIO PRINCIPAL ===
  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
        <h1 style={{ color: '#37cfd4', textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
           Finalizar Pagamento
        </h1>

        {/* Resumo do pacote */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #333',
          borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          <h3 style={{ color: '#37cfd4', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
             Resumo do pedido
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc' }}>
            <span>{pacote.nome} — {pacote.destino}</span>
            <span style={{ color: '#37cfd4', fontWeight: 'bold' }}>
              R$ {pacote.preco.toLocaleString('pt-BR')}
            </span>
          </div>
          <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {pacote.duracao}
          </div>
        </div>

        {/* Escolha do método */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#aaa', marginBottom: '0.75rem' }}>Método de pagamento:</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['cartao', 'pix', 'boleto'].map((m) => (
              <button
                key={m}
                onClick={() => setMetodo(m)}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: metodo === m ? '#37cfd4' : '#252525',
                  color: metodo === m ? '#000' : '#fff',
                  border: '1px solid #444', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 'bold',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'cartao' ? 'Cartão' : m === 'pix' ? 'PIX' : 'Boleto'}
              </button>
            ))}
          </div>
        </div>

        {/* Formulário por método */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #333',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          {/* CARTÃO */}
          {metodo === 'cartao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={estiloLabel}>Nome no cartão</label>
                <input name="nome" value={dados.nome} onChange={handleChange}
                  placeholder="Ex: JOAO A SILVA" style={estiloInput('nome')} />
                {erros.nome && <span style={erroStyle}>{erros.nome}</span>}
              </div>
              <div>
                <label style={estiloLabel}>Número do cartão</label>
                <input name="numero" value={dados.numero}
                  onChange={(e) => setDados((d) => ({ ...d, numero: formatarNumero(e.target.value) }))}
                  placeholder="0000 0000 0000 0000" style={estiloInput('numero')} />
                {erros.numero && <span style={erroStyle}>{erros.numero}</span>}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabel}>Validade</label>
                  <input name="validade" value={dados.validade}
                    onChange={(e) => setDados((d) => ({ ...d, validade: formatarValidade(e.target.value) }))}
                    placeholder="MM/AA" style={estiloInput('validade')} />
                  {erros.validade && <span style={erroStyle}>{erros.validade}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabel}>CVV</label>
                  <input name="cvv" value={dados.cvv}
                    onChange={(e) => setDados((d) => ({ ...d, cvv: e.target.value.replace(/\D/g,'').substring(0,4) }))}
                    placeholder="000" style={estiloInput('cvv')} />
                  {erros.cvv && <span style={erroStyle}>{erros.cvv}</span>}
                </div>
              </div>
              <div>
                <label style={estiloLabel}>Parcelas</label>
                <select name="parcelas" value={dados.parcelas} onChange={handleChange}
                  style={{ ...estiloInput('parcelas'), cursor: 'pointer' }}>
                  {[1,2,3,6,10,12].map((n) => (
                    <option key={n} value={n}>
                      {n}x de R$ {(pacote.preco / n).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      {n === 1 ? ' (sem juros)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PIX */}
          {metodo === 'pix' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#252525', borderRadius: '12px',
                padding: '2rem', marginBottom: '1rem',
                display: 'inline-block',
              }}>
                {/* QR Code simulado */}
                <div style={{
                  width: '160px', height: '160px', background: '#fff',
                  borderRadius: '8px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.7rem', color: '#000',
                  fontFamily: 'monospace', textAlign: 'center', padding: '8px',
                  margin: '0 auto',
                }}>
                  ▄▄▄▄▄▄▄ ▄ ▄▄▄▄▄▄▄<br/>█ ▄▄▄ █▀█▀▀ █ ▄▄▄ █<br/>█▄▄▄▄▄█ QR █▄▄▄▄▄█<br/>▄▄▄▄▄▄▄ CODE ▄▄▄▄▄<br/>▀▄▄▄▄▀ DEMO ▀▄▀▄▀<br/>▄▄▄▄▄▄▄ PIX ▄▄▄▄▄<br/>█ ▄▄▄ █▀▀▄ █▀▀▀▀▀█<br/>▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                </div>
              </div>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                Escaneie o QR Code ou copie a chave abaixo
              </p>
              <div style={{
                background: '#252525', border: '1px solid #444', borderRadius: '8px',
                padding: '0.75rem', marginTop: '0.75rem', color: '#37cfd4',
                fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.85rem',
              }}>
                jlturismo@pagamento.com.br
              </div>
              <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Valor: <strong style={{ color: '#fff' }}>R$ {pacote.preco.toLocaleString('pt-BR')}</strong>
              </p>
            </div>
          )}

          {/* BOLETO */}
          {metodo === 'boleto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={estiloLabel}>Nome completo</label>
                <input name="boletoNome" value={dados.boletoNome} onChange={handleChange}
                  placeholder="Seu nome" style={estiloInput('boletoNome')} />
                {erros.boletoNome && <span style={erroStyle}>{erros.boletoNome}</span>}
              </div>
              <div style={{
                background: '#252525', borderRadius: '8px',
                padding: '1rem', border: '1px dashed #555',
              }}>
                <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                   O boleto será gerado após confirmar. Vencimento em 3 dias úteis.
                </p>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                  Linha digitável (simulação):<br />
                  <span style={{ color: '#37cfd4', fontFamily: 'monospace' }}>
                    34191.09008 04807.097079 09950.800003 2 10000{pacote.preco}0
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botão pagar */}
        <button onClick={handlePagar} style={{
          width: '100%', background: '#37cfd4', color: '#000',
          border: 'none', padding: '1rem', borderRadius: '10px',
          fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
          marginBottom: '1rem',
        }}>
          {metodo === 'cartao'  ? 'Pagar agora' :
           metodo === 'pix'     ? 'Confirmar pagamento PIX' :
                                  'Gerar boleto'}
        </button>

        <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center' }}>
           Ambiente de simulação — nenhuma cobrança real será feita
        </p>
      </div>
    </div>
  );
}

// Estilos auxiliares
const containerStyle = {
  minHeight: '100vh', background: '#0a0a0a',
  color: '#fff', fontFamily: 'sans-serif', padding: '2rem 1rem',
};
const cardStyle = {
  maxWidth: '500px', margin: '0 auto',
  background: '#1a1a1a', borderRadius: '12px',
  border: '1px solid #333',
};
const erroStyle = {
  color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px', display: 'block',
};
const btnPrimStyle = {
  background: '#37cfd4', color: '#000', border: 'none',
  padding: '0.75rem 1.5rem', borderRadius: '8px',
  fontWeight: 'bold', cursor: 'pointer',
};
const btnSecStyle = {
  background: 'transparent', color: '#37cfd4',
  border: '1px solid #37cfd4', padding: '0.75rem 1.5rem',
  borderRadius: '8px', cursor: 'pointer',
};
const spinnerStyle = {
  width: '40px', height: '40px',
  border: '4px solid #333',
  borderTop: '4px solid #37cfd4',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};