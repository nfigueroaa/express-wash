import * as admin from 'firebase-admin';
import { verificarAdmin } from './firestore-admin';
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

    // Verifica la cookie (checkRevoked: true revoca sesiones de usuarios eliminados)
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    if (!decoded.email) return null;

    // Verifica que el email está en la lista de admins
    const esAdmin = await verificarAdmin(decoded.email);
    if (!esAdmin) return null;

    return {
      email: decoded.email,
      nombre: decoded.name || decoded.email,
      foto: decoded.picture,
    };
  } catch {
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
    // Reutiliza la inicialización de firestore-admin si ya ocurrió
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
    }

    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await admin
      .firestore()
      .collection('admins')
      .doc(decodedToken.uid)
      .get();

    const userData = userDoc.data();
    return userData?.role || 'operario'; // Default to operario if not specified
  } catch {
    return null;
  }
}
