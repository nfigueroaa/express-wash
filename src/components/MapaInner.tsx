'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Next.js (los assets no se resuelven automáticamente)
const fixLeafletIcons = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

// Componente para centrar el mapa cuando cambia la ubicación del usuario
function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

interface MapaInnerProps {
  userLat?: number;
  userLon?: number;
  baseLat: number;
  baseLon: number;
  coberturaKm: number;
}

export default function MapaInner({
  userLat,
  userLon,
  baseLat,
  baseLon,
  coberturaKm,
}: MapaInnerProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[baseLat, baseLon]}
      zoom={11}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Círculo de cobertura */}
      <Circle
        center={[baseLat, baseLon]}
        radius={coberturaKm * 1000}
        pathOptions={{
          color: '#00BCD4',
          fillColor: '#00BCD4',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '6 4',
        }}
      />

      {/* Marcador base de operaciones */}
      <Marker position={[baseLat, baseLon]}>
        <Popup>
          <strong>Express Delivery Wash 🧺</strong>
          <br />
          Base de operaciones Santiago centro
        </Popup>
      </Marker>

      {/* Marcador de la dirección del usuario */}
      {userLat && userLon && (
        <>
          <Marker position={[userLat, userLon]}>
            <Popup>📍 Tu dirección de retiro</Popup>
          </Marker>
          <RecenterMap lat={userLat} lon={userLon} />
        </>
      )}
    </MapContainer>
  );
}
