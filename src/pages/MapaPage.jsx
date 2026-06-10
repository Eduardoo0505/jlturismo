// src/pages/MapaPage.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige ícone padrão do Leaflet (bug conhecido no Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Destinos de exemplo (substitua pelos dados reais da sua API /destinos)
const DESTINOS_EXEMPLO = [
  { id: 1, nome: 'Florianópolis', lat: -27.5954, lng: -48.5480, descricao: 'Ilha da Magia' },
  { id: 2, nome: 'Foz do Iguaçu', lat: -25.5162, lng: -54.5854, descricao: 'Cataratas do Iguaçu' },
  { id: 3, nome: 'Bonito',        lat: -21.1261, lng: -56.4836, descricao: 'Ecoturismo e Natureza' },
  { id: 4, nome: 'Salvador',      lat: -12.9714, lng: -38.5014, descricao: 'Pelourinho e Praias' },
  { id: 5, nome: 'Gramado',       lat: -29.3786, lng: -50.8733, descricao: 'Serra Gaúcha' },
];

// Componente que centraliza o mapa na posição do usuário
function CentralizarMapa({ posicao }) {
  const map = useMap();
  useEffect(() => {
    if (posicao) map.setView(posicao, 10);
  }, [posicao, map]);
  return null;
}

export default function MapaPage() {
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [erroGPS, setErroGPS]             = useState('');
  const [carregando, setCarregando]       = useState(false);

  function obterLocalizacao() {
    if (!navigator.geolocation) {
      setErroGPS('Seu navegador não suporta geolocalização.');
      return;
    }
    setCarregando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicaoUsuario([pos.coords.latitude, pos.coords.longitude]);
        setCarregando(false);
      },
      () => {
        setErroGPS('Não foi possível obter sua localização. Verifique as permissões.');
        setCarregando(false);
      }
    );
  }

  const centroInicial = posicaoUsuario || [-15.7801, -47.9292]; // Brasília como padrão

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '2rem', textAlign: 'center', background: '#111' }}>
        <h1 style={{ color: 'rgb(55, 212, 157)', fontSize: '2rem', marginBottom: '0.5rem' }}>
           Mapa de Destinos
        </h1>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>
          Encontre destinos incríveis e veja onde você está agora
        </p>
        <button
          onClick={obterLocalizacao}
          disabled={carregando}
          style={{
            background: '#37d4bc', color: '#000', border: 'none',
            padding: '0.75rem 2rem', borderRadius: '8px',
            fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
          }}
        >
          {carregando ? 'Obtendo localização...' : 'Mostrar minha localização'}
        </button>
        {erroGPS && <p style={{ color: '#ff6b6b', marginTop: '0.5rem' }}>{erroGPS}</p>}
      </div>

      {/* Mapa */}
      <div style={{ height: '60vh', width: '100%' }}>
        <MapContainer
          center={centroInicial}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <CentralizarMapa posicao={posicaoUsuario} />

          {/* Marcador do usuário */}
          {posicaoUsuario && (
            <Marker position={posicaoUsuario}>
              <Popup> Você está aqui!</Popup>
            </Marker>
          )}

          {/* Marcadores de destinos */}
          {DESTINOS_EXEMPLO.map((d) => (
            <Marker key={d.id} position={[d.lat, d.lng]}>
              <Popup>
                <strong>{d.nome}</strong><br />{d.descricao}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Lista de destinos */}
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: 'rgb(55, 212, 157)', marginBottom: '1rem' }}>Nossos Destinos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {DESTINOS_EXEMPLO.map((d) => (
            <div key={d.id} style={{
              background: '#1a1a1a', borderRadius: '10px', padding: '1rem',
              border: '1px solid #333', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem' }}></div>
              <h3 style={{ color: 'rgb(55, 212, 157)', margin: '0.5rem 0 0.25rem' }}>{d.nome}</h3>
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{d.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}