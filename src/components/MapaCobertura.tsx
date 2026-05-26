'use client';

import dynamic from 'next/dynamic';

const MapaInner = dynamic(() => import('./MapaInner'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{ height: '400px', width: '100%', backgroundColor: 'var(--indigo-surface)' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🗺️</div>
        <p className="text-sm" style={{ color: 'var(--indigo-text-muted)' }}>Cargando mapa...</p>
      </div>
    </div>
  ),
});

interface MapaCoberturaProps {
  userLat?: number;
  userLon?: number;
}

export function MapaCobertura({ userLat, userLon }: MapaCoberturaProps) {
  const baseLat = parseFloat(process.env.NEXT_PUBLIC_BASE_LAT || '-33.4489');
  const baseLon = parseFloat(process.env.NEXT_PUBLIC_BASE_LON || '-70.6693');

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--indigo-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--indigo-primary)' }}>
            Zona de Cobertura
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--indigo-text-muted)' }}>
            Cubrimos un radio de <strong style={{ color: 'var(--indigo-primary)' }}>15 km</strong> desde
            Santiago centro. Ingresa tu dirección en el formulario para confirmar.
          </p>
        </div>
        <MapaInner
          userLat={userLat}
          userLon={userLon}
          baseLat={baseLat}
          baseLon={baseLon}
          coberturaKm={15}
        />
      </div>
    </section>
  );
}
