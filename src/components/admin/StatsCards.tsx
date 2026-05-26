import { formatCLP } from '@/lib/utils';
import type { Pedido } from '@/lib/types';

interface StatsCardsProps {
  pedidos: Pedido[];
}

interface StatCard {
  label: string;
  valor: number;
  color: string;
  tipo: 'numero' | 'moneda';
}

export function StatsCards({ pedidos }: StatsCardsProps) {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const enProceso = pedidos.filter((p) => p.estado === 'en_proceso').length;
  const entregados = pedidos.filter((p) => p.estado === 'entregado').length;
  const ingresosMes = pedidos
    .filter((p) => p.creadoEn >= inicioMes && p.estado !== 'cancelado')
    .reduce((acc, p) => acc + p.total, 0);

  const cards: StatCard[] = [
    { label: 'Pendientes', valor: pendientes, color: '#f59e0b', tipo: 'numero' },
    { label: 'En proceso', valor: enProceso, color: '#3b82f6', tipo: 'numero' },
    { label: 'Entregados', valor: entregados, color: '#22c55e', tipo: 'numero' },
    { label: 'Ingresos mes', valor: ingresosMes, color: '#6d28d9', tipo: 'moneda' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#111128',
            borderLeft: `3px solid ${card.color}`,
          }}
        >
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: card.color, fontFamily: 'Montserrat, sans-serif' }}
          >
            {card.tipo === 'moneda' ? formatCLP(card.valor) : card.valor}
          </div>
          <div className="text-xs" style={{ color: '#666' }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
