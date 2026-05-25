'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pedido } from '@/lib/types';
import { StatsCards } from './StatsCards';
import { PedidosTableAdmin } from './PedidosTableAdmin';

export function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchPedidos = async () => {
    try {
      setError(null);
      const response = await fetch('/api/pedidos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Prevenir actualización si component se desmontó
      if (isMountedRef.current) {
        setPedidos(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchPedidos();

    // Auto-refresh cada 30s
    fetchTimeoutRef.current = setInterval(() => {
      fetchPedidos();
    }, 30000);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearInterval(fetchTimeoutRef.current);
      }
    };
  }, []);

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && pedidos.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error al cargar pedidos: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards pedidos={pedidos} />

      {/* Tabla de Pedidos */}
      <PedidosTableAdmin pedidos={pedidos} onRefresh={fetchPedidos} />
    </div>
  );
}
