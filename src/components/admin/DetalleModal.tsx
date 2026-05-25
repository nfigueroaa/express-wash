'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { formatCLP } from '@/lib/utils';
import type { Pedido, EstadoPedido } from '@/lib/types';
import { PRECIOS } from '@/lib/types';

interface DetalleModalProps {
  pedido: Pedido;
  onClose: () => void;
}

const ESTADO_ETIQUETA: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente: '#fbbf24',
  en_proceso: '#60a5fa',
  listo: '#a78bfa',
  entregado: '#34d399',
  cancelado: '#f87171',
};

export function DetalleModal({ pedido, onClose }: DetalleModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Get product names from PRECIOS
  const getNombreProducto = (tipo: string): string => {
    const precio = PRECIOS.find((p) => p.tipo === tipo);
    return precio ? precio.nombre : tipo;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="sticky top-0 flex items-center justify-between p-6 border-b"
            style={{ borderBottomColor: '#1f2937', backgroundColor: '#111128' }}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Detalle del Pedido</h2>
              <p className="text-sm text-gray-500 mt-1">#{pedido.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Cliente Info */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Información del Cliente
              </h3>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: '#1f2937' }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Nombre
                    </p>
                    <p className="text-white font-medium text-lg mt-1">
                      {pedido.nombre}
                    </p>
                  </div>
                  {pedido.telefono && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Teléfono
                      </p>
                      <p className="text-white font-medium text-lg mt-1">
                        {pedido.telefono}
                      </p>
                    </div>
                  )}
                  {pedido.canal && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Canal
                      </p>
                      <p className="text-white font-medium text-lg mt-1">
                        {pedido.canal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Dirección */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Dirección de Entrega
              </h3>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: '#1f2937' }}
              >
                <p className="text-white font-medium">{pedido.direccion}</p>
                {pedido.distanciaKm !== undefined && (
                  <p className="text-gray-400 text-sm mt-2">
                    Distancia: {pedido.distanciaKm.toFixed(1)} km
                  </p>
                )}
                {pedido.lat && pedido.lon && (
                  <p className="text-gray-500 text-xs mt-2">
                    ({pedido.lat.toFixed(4)}, {pedido.lon.toFixed(4)})
                  </p>
                )}
              </div>
            </section>

            {/* Items */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Items del Pedido
              </h3>
              <div className="space-y-3">
                {pedido.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-4 flex items-center justify-between"
                    style={{ backgroundColor: '#1f2937' }}
                  >
                    <div>
                      <p className="text-white font-medium">
                        {getNombreProducto(item.tipo)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: '#c7d2fe' }}>
                      {formatCLP(item.precioUnitario)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Totales */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Resumen de Precios
              </h3>
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: '#1f2937' }}
              >
                <div className="flex items-center justify-between text-white">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCLP(pedido.subtotal)}</span>
                </div>
                {pedido.costoDespacho > 0 && (
                  <div className="flex items-center justify-between text-white">
                    <span>Costo de Despacho</span>
                    <span className="font-medium">
                      {formatCLP(pedido.costoDespacho)}
                    </span>
                  </div>
                )}
                {pedido.descuento > 0 && (
                  <div className="flex items-center justify-between text-green-400">
                    <span>Descuento</span>
                    <span className="font-medium">
                      -{formatCLP(pedido.descuento)}
                    </span>
                  </div>
                )}
                <div
                  className="border-t pt-3 flex items-center justify-between"
                  style={{ borderTopColor: '#374151' }}
                >
                  <span className="text-white font-semibold">Total</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#00BCD4' }}
                  >
                    {formatCLP(pedido.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* Estado */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Estado del Pedido
              </h3>
              <div
                className="rounded-lg p-4 text-center"
                style={{ backgroundColor: '#1f2937' }}
              >
                <div
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-white text-lg"
                  style={{ backgroundColor: ESTADO_COLOR[pedido.estado] + '20' }}
                >
                  <span style={{ color: ESTADO_COLOR[pedido.estado] }}>
                    {ESTADO_ETIQUETA[pedido.estado]}
                  </span>
                </div>
              </div>
            </section>

            {/* Notas */}
            {pedido.notas && (
              <section>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: '#c7d2fe' }}
                >
                  Notas Adicionales
                </h3>
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: '#1f2937' }}
                >
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {pedido.notas}
                  </p>
                </div>
              </section>
            )}

            {/* Fechas */}
            <section>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#c7d2fe' }}
              >
                Información de Fechas
              </h3>
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: '#1f2937' }}
              >
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <span>Creado:</span>
                  <span>
                    {new Date(pedido.creadoEn).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <span>Actualizado:</span>
                  <span>
                    {new Date(pedido.actualizadoEn).toLocaleDateString(
                      'es-CL',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{ borderTopColor: '#1f2937' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#1f2937',
                color: '#9ca3af',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937';
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
