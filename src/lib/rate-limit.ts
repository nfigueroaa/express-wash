/**
 * Rate limiter en memoria para proteger endpoints costosos.
 * En Cloud Run cada instancia tiene su propio mapa, lo que es suficiente
 * para frenar abusos de IPs individuales en instancias normales.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Verifica si la IP excedió el límite de requests.
 * @param ip - IP del cliente
 * @param limit - Máximo de requests permitidos
 * @param windowMs - Ventana de tiempo en ms
 * @returns true si está dentro del límite, false si fue excedido
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Obtiene la IP real del cliente considerando proxies y Cloud Run.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
