// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

const ABAS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'destinos', label: '🌎 Destinos' },
  { id: 'clientes', label: '👥 Clientes' },
  { id: 'interesses', label: '💬 Interesses' },
  { id: 'pagamentos', label: '💳 Pagamentos' },
  { id: 'contatos', label: '📧 Contatos' },
  { id: 'avaliacoes', label: '⭐ Avaliações' },
];

export default function AdminPage() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const [aba, setAba] = useState('dashboard');

  // ===================== STYLES =====================
  const cardStyle = { background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', padding: '1.5rem' };
  const inputStyle = {
    width: '100%', background: '#252525', border: '1px solid #444', borderRadius: '8px',
    padding: '0.7rem', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
  };
  const btnPrim = {
    background: '#37d4af', color: '#000', border: 'none', padding: '0.6rem 1.2rem',
    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem',
  };
  const btnSec = { ...btnPrim, background: '#252525', color: '#37d4af', border: '1px solid #37d4af' };
  const btnDanger = { ...btnPrim, background: '#ff4444', color: '#fff' };
  const tabStyle = (active) => ({
    padding: '0.6rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: active ? 'bold' : 'normal',
    background: active ? '#37d4af' : '#1a1a1a', color: active ? '#000' : '#aaa',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  });
  const thStyle = { padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #333', color: '#888', fontSize: '0.8rem' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #222', fontSize: '0.85rem' };
  const statusBadge = (status) => {
    const colors = {
      novo: { bg: '#1a1a3a', color: '#42a5f5' }, contatado: { bg: '#2a2a1a', color: '#ffc107' },
      convertido: { bg: '#1a3a1a', color: '#4caf50' }, pendente: { bg: '#2a2a1a', color: '#ffc107' },
      aprovado: { bg: '#1a3a1a', color: '#4caf50' }, recusado: { bg: '#2a1a1a', color: '#ff6b6b' },
      cancelado: { bg: '#2a1a1a', color: '#ff6b6b' },
    };
    const c = colors[status] || { bg: '#333', color: '#aaa' };
    return { padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', background: c.bg, color: c.color };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ color: '#37d4af', marginBottom: '1rem' }}>⚙️ Painel Administrativo</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {ABAS.map((a) => (
            <button key={a.id} style={tabStyle(aba === a.id)} onClick={() => setAba(a.id)}>{a.label}</button>
          ))}
        </div>

        {aba === 'dashboard' && <DashboardTab headers={headers} cardStyle={cardStyle} />}
        {aba === 'destinos' && <DestinosTab headers={headers} cardStyle={cardStyle} inputStyle={inputStyle} btnPrim={btnPrim} btnSec={btnSec} btnDanger={btnDanger} thStyle={thStyle} tdStyle={tdStyle} statusBadge={statusBadge} />}
        {aba === 'clientes' && <GenericListTab endpoint="/admin/clientes" headers={headers} cardStyle={cardStyle} thStyle={thStyle} tdStyle={tdStyle}
          columns={[{ key: 'nome', label: 'Nome' }, { key: 'email', label: 'Email' }, { key: 'cpf', label: 'CPF' }, { key: 'telefone', label: 'Telefone' }, { key: 'cidade', label: 'Cidade' }, { key: 'role', label: 'Papel' }]} />}
        {aba === 'interesses' && <InteressesTab headers={headers} cardStyle={cardStyle} thStyle={thStyle} tdStyle={tdStyle} statusBadge={statusBadge} />}
        {aba === 'pagamentos' && <PagamentosTab headers={headers} cardStyle={cardStyle} thStyle={thStyle} tdStyle={tdStyle} statusBadge={statusBadge} />}
        {aba === 'contatos' && <ContatosTab headers={headers} cardStyle={cardStyle} thStyle={thStyle} tdStyle={tdStyle} />}
        {aba === 'avaliacoes' && <GenericListTab endpoint="/admin/avaliacoes" headers={headers} cardStyle={cardStyle} thStyle={thStyle} tdStyle={tdStyle}
          columns={[{ key: 'usuario_nome', label: 'Usuário' }, { key: 'destino_nome', label: 'Destino' }, { key: 'nota', label: 'Nota' }, { key: 'comentario', label: 'Comentário' }]} />}
      </div>
    </div>
  );
}

// ===================== DASHBOARD =====================
function DashboardTab({ headers, cardStyle }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/dashboard`, { headers })
      .then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <p style={{ color: '#888' }}>Carregando dashboard...</p>;

  const stats = [
    { label: 'Usuários', value: data.total_usuarios, icon: '👥', color: '#42a5f5' },
    { label: 'Destinos', value: data.total_destinos, icon: '🌎', color: '#37d4af' },
    { label: 'Interesses', value: data.total_interesses, icon: '💬', color: '#ffc107' },
    { label: 'Pagamentos', value: data.total_pagamentos, icon: '💳', color: '#ab47bc' },
    { label: 'Receita Total', value: `R$ ${data.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: '💰', color: '#4caf50' },
    { label: 'Contatos Pendentes', value: data.total_contatos_nao_lidos, icon: '📧', color: '#ff7043' },
    { label: 'Avaliações', value: data.total_avaliacoes, icon: '⭐', color: '#ffd700' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={cardStyle}>
          <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Últimos Interesses</h3>
          {data.ultimos_interesses.map((i) => (
            <div key={i.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{i.usuario}</strong> → {i.destino}</span>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>{i.status}</span>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Últimos Pagamentos</h3>
          {data.ultimos_pagamentos.map((p) => (
            <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{p.usuario}</strong> — {p.pacote_nome}</span>
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== DESTINOS CRUD =====================
function DestinosTab({ headers, cardStyle, inputStyle, btnPrim, btnSec, btnDanger, thStyle, tdStyle }) {
  const [destinos, setDestinos] = useState([]);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', ativo: true });
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch(`${API_BASE_URL}/admin/destinos?limit=100`, { headers });
    if (res.ok) { const data = await res.json(); setDestinos(data.dados || []); }
  }

  async function salvar() {
    const body = { nome: form.nome, descricao: form.descricao, preco: Number(form.preco), ativo: form.ativo };
    const url = editId ? `${API_BASE_URL}/admin/destinos/${editId}` : `${API_BASE_URL}/admin/destinos`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if (res.ok) { carregar(); limparForm(); }
    else { const d = await res.json(); alert(d.erro || 'Erro'); }
  }

  async function toggleAtivo(id, ativo) {
    await fetch(`${API_BASE_URL}/admin/destinos/${id}/ativo`, {
      method: 'PATCH', headers, body: JSON.stringify({ ativo: !ativo }),
    });
    carregar();
  }

  async function excluir(id) {
    if (!confirm('Excluir destino?')) return;
    const res = await fetch(`${API_BASE_URL}/admin/destinos/${id}`, { method: 'DELETE', headers });
    if (res.ok) carregar();
    else { const d = await res.json(); alert(d.erro || 'Erro ao excluir'); }
  }

  function editar(d) {
    setForm({ nome: d.nome, descricao: d.descricao, preco: d.preco, ativo: d.ativo });
    setEditId(d.id);
    setMostrarForm(true);
  }

  function limparForm() {
    setForm({ nome: '', descricao: '', preco: '', ativo: true });
    setEditId(null);
    setMostrarForm(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ color: '#37d4af' }}>Destinos ({destinos.length})</h3>
        <button style={btnPrim} onClick={() => { limparForm(); setMostrarForm(!mostrarForm); }}>
          {mostrarForm ? 'Fechar' : '+ Novo Destino'}
        </button>
      </div>

      {mostrarForm && (
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <h4 style={{ color: '#aaa', marginBottom: '1rem' }}>{editId ? 'Editar Destino' : 'Novo Destino'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input style={inputStyle} placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <input style={inputStyle} placeholder="Preço" type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
            <textarea style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical', fontFamily: 'sans-serif' }} placeholder="Descrição" rows={3}
              value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <label style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo
            </label>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button style={btnPrim} onClick={salvar}>{editId ? 'Atualizar' : 'Criar'}</button>
            <button style={btnSec} onClick={limparForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Preço</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {destinos.map((d) => (
              <tr key={d.id}>
                <td style={tdStyle}>{d.nome}</td>
                <td style={tdStyle}>R$ {Number(d.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                    background: d.ativo ? '#1a3a1a' : '#2a1a1a', color: d.ativo ? '#4caf50' : '#ff6b6b',
                  }}>{d.ativo ? 'ATIVO' : 'INATIVO'}</span>
                </td>
                <td style={{ ...tdStyle, display: 'flex', gap: '4px' }}>
                  <button style={{ ...btnSec, padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => editar(d)}>✏️</button>
                  <button style={{ ...btnSec, padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => toggleAtivo(d.id, d.ativo)}>
                    {d.ativo ? '🔴' : '🟢'}
                  </button>
                  <button style={{ ...btnDanger, padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => excluir(d.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===================== INTERESSES =====================
function InteressesTab({ headers, cardStyle, thStyle, tdStyle, statusBadge }) {
  const [dados, setDados] = useState([]);
  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch(`${API_BASE_URL}/admin/interesses?limit=100`, { headers });
    if (res.ok) { const d = await res.json(); setDados(d.dados || []); }
  }

  async function mudarStatus(id, status) {
    await fetch(`${API_BASE_URL}/admin/interesses/${id}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    carregar();
  }

  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Interesses ({dados.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Usuário</th><th style={thStyle}>Destino</th>
            <th style={thStyle}>Mensagem</th><th style={thStyle}>Status</th><th style={thStyle}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((i) => (
            <tr key={i.id}>
              <td style={tdStyle}>{i.usuario_nome}<br/><span style={{ color: '#888', fontSize: '0.75rem' }}>{i.usuario_email}</span></td>
              <td style={tdStyle}>{i.destino_nome}</td>
              <td style={tdStyle}>{i.mensagem || '—'}</td>
              <td style={tdStyle}><span style={statusBadge(i.status)}>{i.status.toUpperCase()}</span></td>
              <td style={tdStyle}>
                <select value={i.status} onChange={(e) => mudarStatus(i.id, e.target.value)}
                  style={{ background: '#252525', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem' }}>
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="convertido">Convertido</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===================== PAGAMENTOS =====================
function PagamentosTab({ headers, cardStyle, thStyle, tdStyle, statusBadge }) {
  const [dados, setDados] = useState([]);
  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch(`${API_BASE_URL}/admin/pagamentos?limit=100`, { headers });
    if (res.ok) { const d = await res.json(); setDados(d.dados || []); }
  }

  async function mudarStatus(id, status) {
    await fetch(`${API_BASE_URL}/admin/pagamentos/${id}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    carregar();
  }

  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Pagamentos ({dados.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Usuário</th><th style={thStyle}>Pacote</th>
            <th style={thStyle}>Valor</th><th style={thStyle}>Método</th>
            <th style={thStyle}>Código</th><th style={thStyle}>Status</th><th style={thStyle}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((p) => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.usuario_nome}</td>
              <td style={tdStyle}>{p.pacote_nome}</td>
              <td style={tdStyle}>R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style={tdStyle}>{p.metodo}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.codigo_reserva}</td>
              <td style={tdStyle}><span style={statusBadge(p.status)}>{p.status.toUpperCase()}</span></td>
              <td style={tdStyle}>
                <select value={p.status} onChange={(e) => mudarStatus(p.id, e.target.value)}
                  style={{ background: '#252525', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem' }}>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="recusado">Recusado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===================== CONTATOS =====================
function ContatosTab({ headers, cardStyle, thStyle, tdStyle }) {
  const [dados, setDados] = useState([]);
  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch(`${API_BASE_URL}/admin/contatos?limit=100`, { headers });
    if (res.ok) { const d = await res.json(); setDados(d.dados || []); }
  }

  async function toggleLido(id, lido) {
    await fetch(`${API_BASE_URL}/admin/contatos/${id}/lido`, {
      method: 'PATCH', headers, body: JSON.stringify({ lido: !lido }),
    });
    carregar();
  }

  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Mensagens de Contato ({dados.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Nome</th><th style={thStyle}>Email</th>
            <th style={thStyle}>Mensagem</th><th style={thStyle}>Status</th><th style={thStyle}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((c) => (
            <tr key={c.id} style={{ opacity: c.lido ? 0.6 : 1 }}>
              <td style={tdStyle}>{c.nome}</td>
              <td style={tdStyle}>{c.email}</td>
              <td style={{ ...tdStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.mensagem}</td>
              <td style={tdStyle}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                  background: c.lido ? '#1a3a1a' : '#2a2a1a', color: c.lido ? '#4caf50' : '#ffc107',
                }}>{c.lido ? 'LIDO' : 'NOVO'}</span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => toggleLido(c.id, c.lido)}
                  style={{ background: '#252525', color: '#37d4af', border: '1px solid #37d4af', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
                  {c.lido ? 'Marcar não lido' : 'Marcar lido'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===================== LISTA GENÉRICA =====================
function GenericListTab({ endpoint, headers, cardStyle, thStyle, tdStyle, columns }) {
  const [dados, setDados] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}${endpoint}?limit=100`, { headers })
      .then((r) => r.json())
      .then((d) => setDados(d.dados || []))
      .catch(() => {});
  }, [endpoint]);

  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h3 style={{ color: '#37d4af', marginBottom: '1rem' }}>Total: {dados.length}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={thStyle}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {dados.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((c) => <td key={c.key} style={tdStyle}>{row[c.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
