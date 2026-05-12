'use client';

import { useState, useEffect, useCallback } from 'react';
import { obtenerPedidos, actualizarEstadoPedido } from '@/lib/firestore';
import { formatCLP } from '@/lib/utils';
import type { Pedido, EstadoPedido } from '@/lib/types';

const ESTADOS: EstadoPedido[] = ['pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado'];

const ESTADO_COLORES: Record<EstadoPedido, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  en_proceso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  listo: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  entregado: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function PedidosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    await actualizarEstadoPedido(id, estado);
    cargar();
  };

  const pedidosFiltrados =
    filtroEstado === 'todos'
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12 animate-pulse">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['todos', ...ESTADOS] as const).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filtroEstado === estado
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            {estado}
          </button>
        ))}
        <button
          onClick={cargar}
          className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900/80 text-gray-500 text-xs uppercase border-b border-gray-800">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {pedidosFiltrados.map((p) => (
              <tr key={p.id} className="hover:bg-gray-900/30 transition-colors">
                <td className="px-4 py-3 text-white font-medium">
                  {p.nombre}
                  {p.telefono && (
                    <div className="text-gray-500 text-xs">{p.telefono}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-[180px]">
                  <span className="block truncate" title={p.direccion}>
                    {p.direccion}
                  </span>
                  {p.distanciaKm && (
                    <span className="text-xs text-gray-600">{p.distanciaKm} km</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {p.items.map((item, i) => (
                    <div key={i}>
                      {item.cantidad}x {item.tipo}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: '#00BCD4' }}>
                  {formatCLP(p.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                      ESTADO_COLORES[p.estado]
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(p.creadoEn).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.estado}
                    onChange={(e) =>
                      cambiarEstado(p.id!, e.target.value as EstadoPedido)
                    }
                    className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-pink-500"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pedidosFiltrados.length === 0 && (
        <p className="text-gray-600 text-center py-10">
          {filtroEstado === 'todos'
            ? 'No hay pedidos todavía.'
            : `No hay pedidos con estado "${filtroEstado}".`}
        </p>
      )}

      <p className="text-gray-700 text-xs mt-4 text-right">
        {pedidosFiltrados.length} pedido(s) mostrado(s)
      </p>
    </div>
  );
}
