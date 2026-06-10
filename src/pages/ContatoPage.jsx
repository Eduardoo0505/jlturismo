// src/pages/ContatoPage.jsx
import { useState } from 'react';

export default function ContatoPage() {
  const [form, setForm]       = useState({ nome: '', email: '', mensagem: '' });
  const [enviado, setEnviado] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleEnviar() {
    if (!form.nome || !form.email || !form.mensagem) return;
    setEnviado(true);
  }

  const inputStyle = {
    width: '100%', background: '#252525', border: '1px solid #444',
    borderRadius: '8px', padding: '0.75rem', color: '#fff',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#111', borderBottom: '1px solid #333' }}>
        <h1 style={{ color: '#37cfd4', fontSize: '2.5rem' }}>Fale Conosco</h1>
        <p style={{ color: '#aaa' }}>Estamos prontos para ajudar você a planejar a viagem dos seus sonhos</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Informações */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2 style={{ color: '#37d1d4', marginBottom: '1.5rem' }}>Informações</h2>
          {[
            { icon: '', titulo: 'WhatsApp', valor: '(41) 99999-9999' },
            { icon: '', titulo: 'E-mail',   valor: 'contato@jlturismo.com' },
            { icon: '', titulo: 'Endereço', valor: 'Curitiba, PR' },
            { icon: '', titulo: 'Horário',  valor: 'Seg-Sex: 9h–18h' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div>
                <div style={{ color: '#888', fontSize: '0.8rem' }}>{item.titulo}</div>
                <div style={{ color: '#fff' }}>{item.valor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          {enviado ? (
            <div style={{
              background: '#1a2a1a', border: '1px solid #4caf50',
              borderRadius: '12px', padding: '2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
              <h3 style={{ color: '#4caf50' }}>Mensagem enviada!</h3>
              <p style={{ color: '#aaa' }}>Retornaremos em até 24 horas.</p>
              <button onClick={() => { setForm({ nome: '', email: '', mensagem: '' }); setEnviado(false); }}
                style={{ background: '#37d4bf', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem', fontWeight: 'bold' }}>
                Enviar outra
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Nome</label>
                <input name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>E-mail</label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Mensagem</label>
                <textarea name="mensagem" value={form.mensagem} onChange={handleChange}
                  placeholder="Como podemos ajudar?" rows={5}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif' }} />
              </div>
              <button onClick={handleEnviar} style={{
                background: '#37d4bf', color: '#000', border: 'none',
                padding: '0.9rem', borderRadius: '8px', fontWeight: 'bold',
                cursor: 'pointer', fontSize: '1rem',
              }}>
                Enviar mensagem
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}