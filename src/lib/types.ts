export type EstadoPedido = 'pendiente' | 'en_proceso' | 'listo' | 'entregado' | 'cancelado';

export interface ItemPedido {
  tipo: 'cubrecamas' | 'plumones' | 'colchas' | 'sabanas_ropa';
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id?: string;
  nombre: string;
  telefono?: string;
  direccion: string;
  lat?: number;
  lon?: number;
  distanciaKm?: number;
  items: ItemPedido[];
  subtotal: number;
  costoDespacho: number;
  descuento: number;
  total: number;
  notas?: string;
  estado: EstadoPedido;
  canal?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  distanciaKm: number;
  dentroDeCobertura: boolean;
  costoDespacho: number;
}

export interface PrecioServicio {
  tipo: ItemPedido['tipo'];
  nombre: string;
  precio: number;
  descripcion: string;
}

export const PRECIOS: PrecioServicio[] = [
  { tipo: 'cubrecamas', nombre: 'Cubrecamas 2 plazas', precio: 15000, descripcion: 'Incluye secado · 24-48 hrs' },
  { tipo: 'plumones', nombre: 'Plumones 2 plazas', precio: 18000, descripcion: 'Proceso especial · 48-72 hrs' },
  { tipo: 'colchas', nombre: 'Colchas 2 plazas', precio: 14000, descripcion: '24-48 hrs' },
  { tipo: 'sabanas_ropa', nombre: 'Sábanas y ropa', precio: 8000, descripcion: 'Por cada 5 kg · 24 hrs' },
];
