import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  type Firestore,
} from 'firebase/firestore';
import type { Pedido } from './types';

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }
  const configStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (!configStr) throw new Error('NEXT_PUBLIC_FIREBASE_CONFIG no está configurado');
  const config = JSON.parse(configStr);
  _app = initializeApp(config);
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

/**
 * Crea un nuevo pedido en Firestore y retorna su ID.
 */
export async function crearPedido(pedido: Omit<Pedido, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(getDb(), 'pedidos'), pedido);
  return docRef.id;
}

/**
 * Obtiene todos los pedidos ordenados por fecha de creación (más recientes primero).
 */
export async function obtenerPedidos(): Promise<Pedido[]> {
  const q = query(collection(getDb(), 'pedidos'), orderBy('creadoEn', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pedido));
}

/**
 * Actualiza el estado de un pedido existente.
 */
export async function actualizarEstadoPedido(
  id: string,
  estado: Pedido['estado'],
): Promise<void> {
  await updateDoc(doc(getDb(), 'pedidos', id), {
    estado,
    actualizadoEn: new Date().toISOString(),
  });
}
