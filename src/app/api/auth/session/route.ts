import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { verificarAdmin } from '@/lib/firestore-admin';

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 días

function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
  }
  return admin;
}

/**
 * POST /api/auth/session
 * Recibe un Firebase ID token, verifica que el email esté en 'admins',
 * y crea una session cookie httpOnly de 5 días.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'idToken requerido' }, { status: 400 });
    }

    const adminSdk = getAdminApp();

    // Verificar el ID token de Firebase
    const decoded = await adminSdk.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      return NextResponse.json({ error: 'Email no disponible' }, { status: 400 });
    }

    // Verificar que el email está en la lista de admins
    const esAdmin = await verificarAdmin(decoded.email);
    if (!esAdmin) {
      return NextResponse.json(
        { error: 'No tienes acceso. Contacta al administrador.' },
        { status: 403 },
      );
    }

    // Crear la session cookie de Firebase (válida 5 días)
    const sessionCookie = await adminSdk
      .auth()
      .createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });

    const response = NextResponse.json({ success: true });

    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION_MS / 1000, // en segundos
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('[auth/session POST] Error:', error);
    return NextResponse.json({ error: 'Error al crear sesión' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * Elimina la session cookie (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
  });
  return response;
}
