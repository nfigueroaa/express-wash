'use client';

import { useEffect } from 'react';
import { formatCLP } from '@/lib/utils';
import type { Pedido } from '@/lib/types';

interface DetalleModalProps {
  pedido: Pedido;
  onClose: () => void;
}

export function DetalleModal({ pedido, onClose }: DetalleModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#111128', border: '1px solid #2e3192' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
            >
              {pedido.nombre}
            </h2>
            <div className="text-xs mt-0.5" style={{ color: '#555' }}>
              ID: {pedido.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none hover:text-white transition-colors"
            style={{ color: '#555' }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Cliente */}
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Cliente
            </div>
            <div style={{ color: '#e0e0e0' }}>{pedido.nombre}</div>
            {pedido.telefono && (
              <div style={{ color: '#888' }}>{pedido.telefono}</div>
            )}
          </section>

          <div style={{ borderTop: '1px solid #1a1a2e' }} />

          {/* Dirección */}
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Dirección
            </div>
            <div style={{ color: '#888' }}>{pedido.direccion}</div>
            {pedido.distanciaKm !== undefined && (
              <div className="text-xs mt-0.5" style={{ color: '#555' }}>
                {pedido.distanciaKm} km del centro · Lat {pedido.lat?.toFixed(4)}, Lon{' '}
                {pedido.lon?.toFixed(4)}
              </div>
            )}
          </section>

          <div style={{ borderTop: '1px solid #1a1a2e' }} />

          {/* Items */}
          <section>
            <div className="text-xs uppercase mb-2" style={{ color: '#555' }}>
              Items
            </div>
            <div className="space-y-1">
              {pedido.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1.5"
                  style={{ borderBottom: '1px solid #1a1a2e' }}
                >
                  <span style={{ color: '#888' }}>
                    {item.cantidad}× {item.tipo}
                  </span>
                  <span style={{ color: '#c0c1ff' }}>
                    {formatCLP(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Totales */}
          <section className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Subtotal</span>
              <span>{formatCLP(pedido.subtotal)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between text-xs" style={{ color: '#22c55e' }}>
                <span>Descuento</span>
                <span>-{formatCLP(pedido.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Despacho</span>
              <span>{formatCLP(pedido.costoDespacho)}</span>
            </div>
            <div
              className="flex justify-between font-bold pt-1"
              style={{ color: '#c0c1ff', borderTop: '1px solid #2e3192' }}
            >
              <span>Total</span>
              <span>{formatCLP(pedido.total)}</span>
            </div>
          </section>

          {/* Estado */}
          <div style={{ borderTop: '1px solid #1a1a2e' }} />
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Estado actual
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: '#2e319233', color: '#c0c1ff' }}
            >
              {pedido.estado.replace('_', ' ')}
            </span>
          </section>

          {/* Notas */}
          {pedido.notas && (
            <>
              <div style={{ borderTop: '1px solid #1a1a2e' }} />
              <section>
                <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
                  Notas internas
                </div>
                <div
                  className="text-xs p-3 rounded-lg"
                  style={{ backgroundColor: '#0d0d1f', color: '#888' }}
                >
                  {pedido.notas}
                </div>
              </section>
            </>
          )}

          {/* Fechas */}
          <div style={{ borderTop: '1px solid #1a1a2e' }} />
          <section className="text-xs space-y-1" style={{ color: '#444' }}>
            <div>
              Creado:{' '}
              {new Date(pedido.creadoEn).toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div>
              Actualizado:{' '}
              {new Date(pedido.actualizadoEn).toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
