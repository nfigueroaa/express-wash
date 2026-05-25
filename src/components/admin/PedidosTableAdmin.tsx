'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { formatCLP } from '@/lib/utils';
import type { Pedido, EstadoPedido } from '@/lib/types';
import { DetalleModal } from './DetalleModal';

const ESTADOS: EstadoPedido[] = [
  'pendiente',
  'en_proceso',
  'listo',
  'entregado',
  'cancelado',
];

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente: '#f59e0b',
  en_proceso: '#3b82f6',
  listo: '#a855f7',
  entregado: '#22c55e',
  cancelado: '#ef4444',
};

interface PedidosTableAdminProps {
  pedidos: Pedido[];
  onRefresh: () => Promise<void>;
}

export function PedidosTableAdmin({ pedidos, onRefresh }: PedidosTableAdminProps) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null); // id del pedido
  const [notaTexto, setNotaTexto] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);

  const clockRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar cambios en pedidos y actualizar ultimaActualizacion
  useEffect(() => {
    setUltimaActualizacion(new Date());
    setSegundosDesdeUpdate(0);
  }, [pedidos]);

  // Reloj de "actualizado hace X segundos"
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setSegundosDesdeUpdate((s) => s + 1);
    }, 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  // Mostrar toast temporal
  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Cambiar estado de un pedido
  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Estado actualizado ✓');
      await onRefresh();
    } catch {
      mostrarToast('Error al actualizar estado');
    }
  };

  // Guardar nota interna
  const guardarNota = async (id: string) => {
    setGuardandoNota(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: notaTexto }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Nota guardada ✓');
      setNotaAbierta(null);
      setNotaTexto('');
      await onRefresh();
    } catch {
      mostrarToast('Error al guardar nota');
    } finally {
      setGuardandoNota(false);
    }
  };

  // Abrir formulario de nota para un pedido
  const abrirNota = (pedido: Pedido) => {
    setNotaAbierta(pedido.id!);
    setNotaTexto(pedido.notas || '');
  };

  const pedidosFiltrados =
    filtroEstado === 'todos'
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  const countEstado = (estado: EstadoPedido) =>
    pedidos.filter((p) => p.estado === estado).length;

  // --- RENDER ---

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-xl"
          style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
        >
          {toast}
        </div>
      )}

      {/* Modal de detalle */}
      {pedidoDetalle && (
        <DetalleModal
          pedido={pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
        />
      )}

      {/* Filtros + indicador de refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {/* Chip "Todos" */}
          <button
            onClick={() => setFiltroEstado('todos')}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              filtroEstado === 'todos'
                ? { backgroundColor: '#2e3192', color: '#c0c1ff', borderColor: '#2e3192' }
                : { backgroundColor: 'transparent', color: '#555', borderColor: '#1a1a2e' }
            }
          >
            Todos ({pedidos.length})
          </button>

          {/* Chips por estado */}
          {ESTADOS.map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={
                filtroEstado === estado
                  ? {
                      backgroundColor: ESTADO_COLOR[estado] + '33',
                      color: ESTADO_COLOR[estado],
                      borderColor: ESTADO_COLOR[estado],
                    }
                  : { backgroundColor: 'transparent', color: '#555', borderColor: '#1a1a2e' }
              }
            >
              {estado.replace('_', ' ')} ({countEstado(estado)})
            </button>
          ))}
        </div>

        {/* Indicador auto-refresh */}
        <div className="text-xs" style={{ color: '#444' }}>
          🔄{' '}
          {ultimaActualizacion
            ? `Actualizado hace ${segundosDesdeUpdate}s`
            : 'Cargando...'}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a2e' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead style={{ backgroundColor: '#0d0d1f' }}>
              <tr>
                {['Cliente', 'Dirección', 'Items', 'Total', 'Estado', 'Fecha', 'Acciones'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs uppercase"
                      style={{ color: '#555' }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p, idx) => (
                <Fragment key={p.id}>
                  {/* Fila del pedido */}
                  <tr
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#111128' : '#0d0d1f',
                      borderTop: '1px solid #1a1a2e',
                    }}
                  >
                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: '#fff' }}>
                        {p.nombre}
                      </div>
                      {p.telefono && (
                        <div className="text-xs" style={{ color: '#555' }}>
                          {p.telefono}
                        </div>
                      )}
                    </td>

                    {/* Dirección */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <div
                        className="truncate text-xs"
                        title={p.direccion}
                        style={{ color: '#888' }}
                      >
                        {p.direccion}
                      </div>
                      {p.distanciaKm !== undefined && (
                        <div className="text-xs" style={{ color: '#555' }}>
                          {p.distanciaKm} km
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-xs" style={{ color: '#888' }}>
                      {p.items.map((item, i) => (
                        <div key={i}>
                          {item.cantidad}× {item.tipo}
                        </div>
                      ))}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-bold" style={{ color: '#c0c1ff' }}>
                      {formatCLP(p.total)}
                    </td>

                    {/* Estado (dropdown) */}
                    <td className="px-4 py-3">
                      <select
                        value={p.estado}
                        onChange={(e) =>
                          cambiarEstado(p.id!, e.target.value as EstadoPedido)
                        }
                        className="text-xs rounded px-2 py-1 border focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: '#0d0d1f',
                          color: ESTADO_COLOR[p.estado],
                          borderColor: ESTADO_COLOR[p.estado] + '55',
                        }}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {e.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-xs" style={{ color: '#555' }}>
                      {new Date(p.creadoEn).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPedidoDetalle(p)}
                          className="text-xs px-2 py-1 rounded border transition-colors hover:border-gray-500"
                          style={{
                            backgroundColor: '#0d0d1f',
                            color: '#888',
                            borderColor: '#1a1a2e',
                          }}
                        >
                          👁 Detalle
                        </button>
                        <button
                          onClick={() =>
                            notaAbierta === p.id
                              ? setNotaAbierta(null)
                              : abrirNota(p)
                          }
                          className="text-xs px-2 py-1 rounded border transition-colors hover:border-gray-500"
                          style={{
                            backgroundColor: notaAbierta === p.id ? '#2e319233' : '#0d0d1f',
                            color: notaAbierta === p.id ? '#c0c1ff' : '#888',
                            borderColor: notaAbierta === p.id ? '#2e3192' : '#1a1a2e',
                          }}
                        >
                          📝 Nota{p.notas ? ' ●' : ''}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila de nota inline (se expande debajo del pedido) */}
                  {notaAbierta === p.id && (
                    <tr
                      style={{
                        backgroundColor: '#09090f',
                        borderTop: '1px solid #2e3192',
                      }}
                    >
                      <td
                        colSpan={7}
                        className="px-4 py-3"
                      >
                        <div className="flex gap-3 items-start">
                          <textarea
                            value={notaTexto}
                            onChange={(e) => setNotaTexto(e.target.value)}
                            rows={2}
                            placeholder="Escribe una nota interna sobre este pedido..."
                            className="flex-1 text-xs rounded-lg px-3 py-2 resize-none focus:outline-none"
                            style={{
                              backgroundColor: '#111128',
                              color: '#c0c1ff',
                              border: '1px solid #2e3192',
                            }}
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => guardarNota(p.id!)}
                              disabled={guardandoNota}
                              className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-opacity"
                              style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
                            >
                              {guardandoNota ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => setNotaAbierta(null)}
                              className="text-xs px-3 py-1.5 rounded"
                              style={{ backgroundColor: '#1a1a2e', color: '#555' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado vacío */}
      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-16" style={{ color: '#555' }}>
          {filtroEstado === 'todos'
            ? 'No hay pedidos todavía.'
            : `No hay pedidos con estado "${filtroEstado.replace('_', ' ')}".`}
        </div>
      )}

      {/* Conteo */}
      <div className="text-xs mt-3 text-right" style={{ color: '#333' }}>
        {pedidosFiltrados.length} pedido(s)
      </div>
    </div>
  );
}
