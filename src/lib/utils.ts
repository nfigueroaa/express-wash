import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ItemPedido } from './types';

// Shadcn utility (mantener siempre)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Constantes del negocio
export const BASE_LAT = parseFloat(process.env.NEXT_PUBLIC_BASE_LAT || '-33.4489');
export const BASE_LON = parseFloat(process.env.NEXT_PUBLIC_BASE_LON || '-70.6693');
export const COBERTURA_KM = 15;
export const DESPACHO_BASE = 2000;
export const DESPACHO_POR_KM = 500;
export const DESPACHO_GRATIS_DESDE = 30000;

/**
 * Calcula distancia en km entre dos coordenadas usando fórmula Haversine.
 */
export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calcula el costo de despacho.
 * Es GRATIS si el subtotal supera DESPACHO_GRATIS_DESDE.
 * De lo contrario: base + ceil(km) * por_km.
 */
export function calcularDespacho(distanciaKm: number, subtotal: number): number {
  if (subtotal >= DESPACHO_GRATIS_DESDE) return 0;
  return DESPACHO_BASE + Math.ceil(distanciaKm) * DESPACHO_POR_KM;
}

/**
 * Calcula descuentos automáticos por volumen y distancia.
 * - Subtotal > 80k: 15%
 * - Subtotal > 50k: 10%
 * - Distancia > 10km: +5% adicional
 */
export function calcularDescuento(subtotal: number, distanciaKm: number): number {
  let pct = 0;
  if (subtotal >= 80000) pct = 0.15;
  else if (subtotal >= 50000) pct = 0.10;
  if (distanciaKm > 10) pct += 0.05;
  return Math.round(subtotal * pct);
}

/**
 * Formatea un número como moneda CLP (ej: $15.000).
 */
export function formatCLP(valor: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Calcula el subtotal de una lista de items.
 */
export function calcularSubtotal(items: ItemPedido[]): number {
  return items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
}
