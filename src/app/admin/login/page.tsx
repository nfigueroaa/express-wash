'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

// Inicializar Firebase Client SDK (reutiliza si ya fue inicializado)
const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!);
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // true al inicio para capturar redirect result
  const [error, setError] = useState<string | null>(null);

  // Al montar, verificar si venimos de un redirect de Google
  useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) {
          // No hay resultado de redirect — primera carga normal
          setLoading(false);
          return;
        }
        // Tenemos resultado del redirect de Google
        const idToken = await result.user.getIdToken();
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'No tienes acceso. Contacta al administrador.');
          setLoading(false);
          return;
        }

        router.push('/admin');
        router.refresh();
      })
      .catch((err) => {
        console.error('[login] Error en getRedirectResult:', err);
        setError('Error al iniciar sesión. Intenta nuevamente.');
        setLoading(false);
      });
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // La página se redirige a Google — el resultado se procesa en el useEffect al volver
    } catch {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div
        className="rounded-xl p-8 w-full max-w-sm text-center"
        style={{ backgroundColor: '#111128', border: '1px solid #1a1a2e' }}
      >
        <div
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--indigo-primary)', fontFamily: 'Montserrat, sans-serif' }}
        >
          ⚡ Express Wash
        </div>
        <div className="text-sm mb-8" style={{ color: '#555' }}>
          Panel de administración
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: '#fff', color: '#333' }}
        >
          {/* Logo G de Google */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Iniciando sesión...' : 'Entrar con Google'}
        </button>

        {error && (
          <div
            className="mt-4 text-xs px-3 py-2 rounded"
            style={{
              backgroundColor: '#2d1515',
              color: '#ef4444',
              border: '1px solid #ef444433',
            }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 text-xs" style={{ color: '#444' }}>
          Solo usuarios autorizados
        </div>
      </div>
    </main>
  );
}
