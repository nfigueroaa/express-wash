import { NextRequest, NextResponse } from 'next/server';
import {
  calcularDistanciaKm,
  calcularDespacho,
  BASE_LAT,
  BASE_LON,
  COBERTURA_KM,
} from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Parámetro q requerido' }, { status: 400 });
  }

  try {
    // Nominatim geocoding — requiere User-Agent identificable (política de uso)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q + ', Santiago, Chile',
    )}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ExpressDeliveryWash/1.0 (hola@expressdeliverywash.cl)',
        'Accept-Language': 'es',
      },
      next: { revalidate: 3600 }, // Cache 1 hora para la misma dirección
    });

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data = await res.json();

    if (!data.length) {
      return NextResponse.json(
        { error: 'Dirección no encontrada. Intenta ser más específico.' },
        { status: 404 },
      );
    }

    const { lat, lon, display_name } = data[0];
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanciaKm = calcularDistanciaKm(BASE_LAT, BASE_LON, latNum, lonNum);
    const distanciaRedondeada = Math.round(distanciaKm * 10) / 10;

    return NextResponse.json({
      lat: latNum,
      lon: lonNum,
      displayName: display_name,
      distanciaKm: distanciaRedondeada,
      dentroDeCobertura: distanciaKm <= COBERTURA_KM,
      costoDespacho: calcularDespacho(distanciaKm, 0),
    });
  } catch (error) {
    console.error('[geo] Error geocodificando:', error);
    return NextResponse.json(
      { error: 'Error al geocodificar la dirección. Intenta de nuevo.' },
      { status: 500 },
    );
  }
}
