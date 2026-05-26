'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRECIOS } from '@/lib/types';
import { calcularDescuento, calcularDespacho, formatCLP } from '@/lib/utils';

type Cantidades = Partial<Record<string, number>>;

const DISTANCIA_EJEMPLO = 5; // km promedio para la calculadora

export function CalculadoraPedido() {
  const [cantidades, setCantidades] = useState<Cantidades>({});

  const subtotal = PRECIOS.reduce(
    (acc, s) => acc + (cantidades[s.tipo] || 0) * s.precio,
    0,
  );
  const descuento = calcularDescuento(subtotal, DISTANCIA_EJEMPLO);
  const subtotalConDescuento = subtotal - descuento;
  const despacho = calcularDespacho(DISTANCIA_EJEMPLO, subtotalConDescuento);
  const total = subtotalConDescuento + despacho;

  const incrementar = (tipo: string) =>
    setCantidades((prev) => ({ ...prev, [tipo]: (prev[tipo] || 0) + 1 }));

  const decrementar = (tipo: string) =>
    setCantidades((prev) => ({ ...prev, [tipo]: Math.max(0, (prev[tipo] || 0) - 1) }));

  return (
    <section id="calculadora" className="py-20 px-4" style={{ backgroundColor: 'var(--indigo-bg)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--indigo-primary)' }}>
            Calcula tu pedido
          </h2>
          <p style={{ color: 'var(--indigo-text-muted)' }}>
            El despacho real varía según tu dirección. Este es un estimado.
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--indigo-surface)',
            border: '1px solid var(--indigo-border)',
          }}
        >
            <div className="space-y-4">
              {PRECIOS.map((s) => (
                <div
                  key={s.tipo}
                  className="flex items-center justify-between py-3 last:border-0"
                  style={{ borderBottom: '1px solid var(--indigo-border)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--indigo-primary)' }}>{s.nombre}</p>
                    <p className="text-sm" style={{ color: 'var(--indigo-text-muted)' }}>{formatCLP(s.precio)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decrementar(s.tipo)}
                      className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity flex items-center justify-center font-bold"
                      style={{ backgroundColor: 'var(--indigo-surface-2)', color: 'var(--indigo-primary)', border: '1px solid var(--indigo-border)' }}
                      aria-label={`Quitar ${s.nombre}`}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-semibold" style={{ color: 'var(--indigo-primary)' }}>
                      {cantidades[s.tipo] || 0}
                    </span>
                    <button
                      onClick={() => incrementar(s.tipo)}
                      className="w-8 h-8 rounded-full text-white hover:opacity-80 transition-opacity flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#E91E63' }}
                      aria-label={`Agregar ${s.nombre}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {subtotal > 0 && (
              <div className="mt-6 space-y-2 pt-4" style={{ borderTop: '1px solid var(--indigo-border)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--indigo-text-muted)' }}>
                  <span>Subtotal</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-green-500 text-sm">
                    <span>Descuento por volumen</span>
                    <span>−{formatCLP(descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm" style={{ color: 'var(--indigo-text-muted)' }}>
                  <span>Despacho estimado</span>
                  <span className={despacho === 0 ? 'text-green-500 font-semibold' : ''}>
                    {despacho === 0 ? '¡GRATIS!' : formatCLP(despacho)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3" style={{ borderTop: '1px solid var(--indigo-border)', color: 'var(--indigo-primary)' }}>
                  <span>Total estimado</span>
                  <span style={{ color: 'var(--indigo-tertiary)' }}>{formatCLP(total)}</span>
                </div>

                <Link href="/pedido" className="block mt-5">
                  <Button
                    className="w-full text-white font-bold py-5 text-base rounded-full"
                    style={{ backgroundColor: '#E91E63', border: 'none' }}
                  >
                    Ir al formulario de pedido →
                  </Button>
                </Link>
              </div>
            )}

            {subtotal === 0 && (
              <p className="text-sm text-center mt-4" style={{ color: 'var(--indigo-text-faint)' }}>
                Selecciona items para ver el precio estimado
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
