import * as admin from 'firebase-admin';
import type { Pedido } from './types';

let _db: admin.firestore.Firestore | null = null;

/**
 * Inicializa Firebase Admin SDK con Application Default Credentials.
 * En Cloud Run, esto usa automáticamente las credenciales del servicio.
 * En desarrollo local, requiere GOOGLE_APPLICATION_CREDENTIALS.
 */
function getDb(): admin.firestore.Firestore {
  if (_db) return _db;

  // Inicializar Admin SDK si no está hecho
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'expresswash-prod-202605112332',
    });
  }

  _db = admin.firestore();
  return _db;
}

/**
 * Crea un nuevo pedido en Firestore y retorna su ID.
 * Usa HTTP REST a través de Admin SDK (compatible con Cloud Run).
 */
export async function crearPedido(pedido: Omit<Pedido, 'id'>): Promise<string> {
  const db = getDb();
  const docRef = await db.collection('pedidos').add(pedido);
  return docRef.id;
}

/**
 * Obtiene todos los pedidos ordenados por fecha de creación (más recientes primero).
 */
export async function obtenerPedidos(): Promise<Pedido[]> {
  const db = getDb();
  const snapshot = await db
    .collection('pedidos')
    .orderBy('creadoEn', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Pedido));
}

/**
 * Actualiza el estado de un pedido existente.
 */
export async function actualizarEstadoPedido(
  id: string,
  estado: Pedido['estado'],
): Promise<void> {
  const db = getDb();
  await db.collection('pedidos').doc(id).update({
    estado,
    actualizadoEn: new Date().toISOString(),
  });
}

/**
 * Verifica si un email está en la colección 'admins' y tiene activo: true.
 * Si el campo 'activo' no existe, asume true (retrocompatibilidad).
 */
export async function verificarAdmin(email: string): Promise<boolean> {
  const db = getDb();
  const doc = await db.collection('admins').doc(email).get();
  if (!doc.exists) return false;
  const data = doc.data();
  return data?.activo !== false; // true si activo no está definido o es true
}

/**
 * Actualiza campos parciales de un pedido (estado y/o notas).
 * Siempre actualiza actualizadoEn.
 */
export async function actualizarPedidoParcial(
  id: string,
  updates: Partial<Pick<Pedido, 'estado' | 'notas'>>,
): Promise<void> {
  const db = getDb();
  await db.collection('pedidos').doc(id).update({
    ...updates,
    actualizadoEn: new Date().toISOString(),
  });
}
