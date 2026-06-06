import * as admin from 'firebase-admin';
import { verificarAdmin, getDb } from './firestore-admin';
import type { UsuarioAdmin } from './types';

/**
 * Verifica una Firebase session cookie y retorna el usuario admin si es válido.
 * Retorna null si la cookie es inválida, expirada, o el email no está en 'admins'.
 */
export async function verifySessionCookie(
  sessionCookie: string,
): Promise<UsuarioAdmin | null> {
  try {
    // Reutiliza la inicialización de firestore-admin si ya ocurrió
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
    }

    // Verifica la cookie criptográficamente (sin llamada de red extra)
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, false);

    if (!decoded.email) return null;

    // Verifica que el email está en la lista de admins (usa el mismo path que antes)
    const esAdmin = await verificarAdmin(decoded.email);
    if (!esAdmin) return null;

    // Obtener el rol (campo opcional — default: operario)
    const db = getDb();
    const adminDoc = await db.collection('admins').doc(decoded.email).get();
    const role = (adminDoc.data()?.role as 'admin' | 'supervisor' | 'operario') || 'operario';

    return {
      email: decoded.email,
      nombre: decoded.name || decoded.email,
      foto: decoded.picture,
      role,
    };
  } catch (err) {
    console.error('[auth] verifySessionCookie error:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Obtiene el rol del usuario desde Firestore.
 * Retorna el rol del usuario o 'operario' como default.
 */
export async function getUserRole(
  session: string,
): Promise<'admin' | 'supervisor' | 'operario' | null> {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
    }

    const decodedToken = await admin.auth().verifySessionCookie(session, false);
    if (!decodedToken.email) return null;

    const db = getDb();
    const userDoc = await db.collection('admins').doc(decodedToken.email).get();
    return (userDoc.data()?.role as 'admin' | 'supervisor' | 'operario') || 'operario';
  } catch {
    return null;
  }
}
