/**
 * Logger estructurado en JSON para Cloud Logging.
 * Cloud Run captura stdout/stderr automáticamente.
 * El formato JSON permite filtros y métricas en Cloud Console.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface LogEntry {
  severity: LogLevel;
  message: string;
  route?: string;
  ip?: string;
  pedidoId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

function log(entry: LogEntry) {
  // Cloud Logging interpreta JSON en stdout como structured log
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, meta?: Partial<LogEntry>) =>
    log({ severity: 'INFO', message, ...meta }),

  warn: (message: string, meta?: Partial<LogEntry>) =>
    log({ severity: 'WARNING', message, ...meta }),

  error: (message: string, meta?: Partial<LogEntry>) =>
    log({ severity: 'ERROR', message, ...meta }),

  debug: (message: string, meta?: Partial<LogEntry>) =>
    log({ severity: 'DEBUG', message, ...meta }),
};

/**
 * Mide el tiempo de una operación async y loguea el resultado.
 * Uso: const result = await withTiming('crearPedido', () => crearPedido(data));
 */
export async function withTiming<T>(
  label: string,
  fn: () => Promise<T>,
  meta?: Partial<LogEntry>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logger.info(`${label} completado`, { ...meta, durationMs: Date.now() - start });
    return result;
  } catch (err) {
    logger.error(`${label} falló`, {
      ...meta,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
