'use client';

import dynamic from 'next/dynamic';

const MapaInner = dynamic(() => import('./MapaInner'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-800 rounded-xl"
      style={{ height: '400px', width: '100%' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🗺️</div>
        <p className="text-gray-400 text-sm">Cargando mapa...</p>
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
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Zona de Cobertura
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Cubrimos un radio de <strong className="text-white">15 km</strong> desde
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
