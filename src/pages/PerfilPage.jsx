// src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

export default function PerfilPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [perfil, setPerfil] = useState(null);
  const [interesses, setInteresses] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('dados');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [perfilRes, interRes, pagRes] = await Promise.all([
        fetch(`${API_BASE_URL}/perfil`, { headers }),
        fetch(`${API_BASE_URL}/perfil/interesses`, { headers }),
        fetch(`${API_BASE_URL}/perfil/pagamentos`, { headers }),
      ]);
      if (perfilRes.ok) {
        const p = await perfilRes.json();
        setPerfil(p);
        setForm(p);
      }
      if (interRes.ok) setInteresses(await interRes.json());
      if (pagRes.ok) setPagamentos(await pagRes.json());
    } catch {
      setErro('Erro ao carregar perfil');
    }
  }

  async function salvarPerfil() {
    setMsg(''); setErro('');
    try {
      const res = await fetch(`${API_BASE_URL}/perfil`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          nome: form.nome, telefone: form.telefone,
          cep: form.cep, rua: form.rua, cidade: form.cidade, estado: form.estado,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPerfil(updated);
        setEditando(false);
        setMsg('Perfil atualizado!');
      } else {
        const data = await res.json();
        setErro(data.erro || 'Erro ao salvar');
      }
    } catch { setErro('Erro de conexão'); }
  }

  async function alterarSenha() {
    setMsg(''); setErro('');
    if (senhaForm.novaSenha !== senhaForm.confirmar) {
      setErro('As senhas não coincidem');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/perfil/senha`, {
        method: 'PUT', headers,
        body: JSON.stringify({ senhaAtual: senhaForm.senhaAtual, novaSenha: senhaForm.novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Senha alterada!');
        setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' });
        setMostrarSenha(false);
      } else {
        setErro(data.erro || 'Erro ao alterar senha');
      }
    } catch { setErro('Erro de conexão'); }
  }

  const inputStyle = {
    width: '100%', background: '#252525', border: '1px solid #444',
    borderRadius: '8px', padding: '0.7rem', color: '#fff', fontSize: '0.95rem',
    boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = { color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '4px' };
  const cardStyle = { background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', padding: '1.5rem', marginBottom: '1rem' };
  const btnStyle = {
    background: '#37d4af', color: '#000', border: 'none', padding: '0.7rem 1.5rem',
    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
  };
  const tabStyle = (active) => ({
    padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
    background: active ? '#37d4af' : '#252525',
    color: active ? '#000' : '#aaa',
    transition: 'all 0.2s',
  });

  if (!perfil) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ color: '#37d4af', marginBottom: '0.5rem' }}>👤 Meu Perfil</h1>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>{perfil.email}</p>

        {msg && <div style={{ background: '#1a2a1a', border: '1px solid #4caf50', borderRadius: '8px', padding: '0.75rem', color: '#4caf50', marginBottom: '1rem' }}>{msg}</div>}
        {erro && <div style={{ background: '#2a1a1a', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '0.75rem', color: '#ff6b6b', marginBottom: '1rem' }}>{erro}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button style={tabStyle(aba === 'dados')} onClick={() => setAba('dados')}>Dados Pessoais</button>
          <button style={tabStyle(aba === 'interesses')} onClick={() => setAba('interesses')}>Meus Interesses ({interesses.length})</button>
          <button style={tabStyle(aba === 'pagamentos')} onClick={() => setAba('pagamentos')}>Meus Pagamentos ({pagamentos.length})</button>
        </div>

        {/* Dados Pessoais */}
        {aba === 'dados' && (
          <div style={cardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input style={inputStyle} value={form.nome || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input style={inputStyle} value={form.telefone || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>CEP</label>
                <input style={inputStyle} value={form.cep || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input style={inputStyle} value={form.estado || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Rua</label>
                <input style={inputStyle} value={form.rua || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, rua: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input style={inputStyle} value={form.cidade || ''} disabled={!editando}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>CPF</label>
                <input style={inputStyle} value={form.cpf || ''} disabled />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {editando ? (
                <>
                  <button style={btnStyle} onClick={salvarPerfil}>Salvar</button>
                  <button style={{ ...btnStyle, background: '#333', color: '#aaa' }} onClick={() => { setEditando(false); setForm(perfil); }}>Cancelar</button>
                </>
              ) : (
                <button style={btnStyle} onClick={() => setEditando(true)}>Editar Dados</button>
              )}
              <button style={{ ...btnStyle, background: '#252525', color: '#37d4af', border: '1px solid #37d4af' }}
                onClick={() => setMostrarSenha(!mostrarSenha)}>
                {mostrarSenha ? 'Fechar' : '🔒 Alterar Senha'}
              </button>
            </div>

            {mostrarSenha && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#111', borderRadius: '8px', border: '1px solid #444' }}>
                <h4 style={{ color: '#aaa', marginBottom: '1rem' }}>Alterar Senha</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input style={inputStyle} type="password" placeholder="Senha atual"
                    value={senhaForm.senhaAtual} onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })} />
                  <input style={inputStyle} type="password" placeholder="Nova senha (mín. 6 caracteres)"
                    value={senhaForm.novaSenha} onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })} />
                  <input style={inputStyle} type="password" placeholder="Confirmar nova senha"
                    value={senhaForm.confirmar} onChange={(e) => setSenhaForm({ ...senhaForm, confirmar: e.target.value })} />
                  <button style={btnStyle} onClick={alterarSenha}>Confirmar Alteração</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interesses */}
        {aba === 'interesses' && (
          <div>
            {interesses.length === 0 ? (
              <div style={cardStyle}><p style={{ color: '#888' }}>Nenhum interesse registrado.</p></div>
            ) : interesses.map((i) => (
              <div key={i.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#37d4af', margin: '0 0 4px' }}>{i.destino_nome}</h4>
                  <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                    R$ {Number(i.destino_preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {i.mensagem && ` — "${i.mensagem}"`}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                  background: i.status === 'convertido' ? '#1a3a1a' : i.status === 'contatado' ? '#2a2a1a' : '#1a1a2a',
                  color: i.status === 'convertido' ? '#4caf50' : i.status === 'contatado' ? '#ffc107' : '#42a5f5',
                }}>{i.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pagamentos */}
        {aba === 'pagamentos' && (
          <div>
            {pagamentos.length === 0 ? (
              <div style={cardStyle}><p style={{ color: '#888' }}>Nenhum pagamento realizado.</p></div>
            ) : pagamentos.map((p) => (
              <div key={p.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#37d4af', margin: '0 0 4px' }}>{p.pacote_nome}</h4>
                  <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0 0 2px' }}>
                    R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — {p.metodo}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.8rem', margin: 0, fontFamily: 'monospace' }}>
                    {p.codigo_reserva}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                  background: p.status === 'aprovado' ? '#1a3a1a' : p.status === 'pendente' ? '#2a2a1a' : '#2a1a1a',
                  color: p.status === 'aprovado' ? '#4caf50' : p.status === 'pendente' ? '#ffc107' : '#ff6b6b',
                }}>{p.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
