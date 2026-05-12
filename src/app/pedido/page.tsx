'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapaCobertura } from '@/components/MapaCobertura';
import { PRECIOS } from '@/lib/types';
import { formatCLP, calcularDescuento, calcularDespacho } from '@/lib/utils';
import type { GeoResult, ItemPedido } from '@/lib/types';

type Cantidades = Partial<Record<string, number>>;

export default function PedidoPage() {
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [cantidades, setCantidades] = useState<Cantidades>({});

  // Estado de geocoding
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Estado del submit
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pedidoId, setPedidoId] = useState('');

  // Cálculos
  const subtotal = PRECIOS.reduce(
    (acc, s) => acc + (cantidades[s.tipo] || 0) * s.precio,
    0,
  );
  const distancia = geo?.distanciaKm || 5;
  const descuento = calcularDescuento(subtotal, distancia);
  const subtotalConDesc = subtotal - descuento;
  const despacho = calcularDespacho(distancia, subtotalConDesc);
  const total = subtotalConDesc + despacho;

  const incrementar = (tipo: string) =>
    setCantidades((prev) => ({ ...prev, [tipo]: (prev[tipo] || 0) + 1 }));
  const decrementar = (tipo: string) =>
    setCantidades((prev) => ({ ...prev, [tipo]: Math.max(0, (prev[tipo] || 0) - 1) }));

  const geocodificar = async () => {
    if (!direccion.trim()) return;
    setGeoLoading(true);
    setGeoError('');
    try {
      const res = await fetch(`/api/geo?q=${encodeURIComponent(direccion)}`);
      const data = await res.json();
      if (data.error || !res.ok) {
        setGeoError(data.error || 'No se encontró la dirección.');
        setGeo(null);
        return;
      }
      setGeo(data);
      if (!data.dentroDeCobertura) {
        setGeoError(
          `Tu dirección está a ${data.distanciaKm} km — fuera de nuestra zona de cobertura (15 km).`,
        );
      }
    } catch {
      setGeoError('Error verificando dirección. Intenta de nuevo.');
      setGeo(null);
    } finally {
      setGeoLoading(false);
    }
  };

  const enviarPedido = async () => {
    setSubmitError('');

    if (!nombre.trim()) {
      setSubmitError('Por favor ingresa tu nombre.');
      return;
    }
    if (!direccion.trim()) {
      setSubmitError('Por favor ingresa tu dirección.');
      return;
    }
    if (subtotal === 0) {
      setSubmitError('Agrega al menos un item al pedido.');
      return;
    }
    if (geo && !geo.dentroDeCobertura) {
      setSubmitError('Lo sentimos, tu dirección está fuera de nuestra zona de cobertura.');
      return;
    }

    const items: ItemPedido[] = PRECIOS.filter(
      (s) => (cantidades[s.tipo] || 0) > 0,
    ).map((s) => ({
      tipo: s.tipo,
      cantidad: cantidades[s.tipo]!,
      precioUnitario: s.precio,
    }));

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          notas: notas.trim(),
          items,
          subtotal,
          descuento,
          costoDespacho: despacho,
          total,
          lat: geo?.lat,
          lon: geo?.lon,
          distanciaKm: geo?.distanciaKm,
          canal: 'web',
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error desconocido');
      setPedidoId(data.id);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Error enviando pedido. Intenta de nuevo.',
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Pantalla de confirmación
  if (pedidoId) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🧺</div>
          <h1 className="text-3xl font-bold text-white mb-4">¡Pedido recibido!</h1>
          <p className="text-gray-400 mb-2">
            Tu pedido{' '}
            <span className="text-white font-mono font-bold">
              #{pedidoId.slice(-6).toUpperCase()}
            </span>{' '}
            fue creado exitosamente.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Nos contactaremos contigo para coordinar el retiro. ¡Gracias! 😊
          </p>
          <Link href="/">
            <Button
              className="text-white font-bold px-8 rounded-full"
              style={{ backgroundColor: '#E91E63', border: 'none' }}
            >
              Volver al inicio
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm mb-4 inline-block transition-colors"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-white">Hacer un Pedido</h1>
          <p className="text-gray-500 mt-1">
            Completa el formulario y nos ponemos en contacto.
          </p>
        </div>

        {/* Datos personales */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Tus datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-400 text-sm">Nombre completo *</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Teléfono (opcional)</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 XXXX XXXX"
                type="tel"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Dirección de retiro *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  onBlur={geocodificar}
                  placeholder="Av. Principal 123, Providencia"
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-600"
                />
                <Button
                  onClick={geocodificar}
                  disabled={geoLoading || !direccion.trim()}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 shrink-0"
                >
                  {geoLoading ? '...' : 'Verificar'}
                </Button>
              </div>
              {geo?.dentroDeCobertura && (
                <p className="text-green-400 text-xs mt-1">
                  ✅ {geo.distanciaKm} km desde la base — dentro de cobertura
                </p>
              )}
              {geoError && (
                <p className="text-red-400 text-xs mt-1">⚠️ {geoError}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Notas adicionales</Label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Horario preferido de retiro, piso, depto, instrucciones..."
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-600 resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selección de items */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Items a lavar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRECIOS.map((s) => (
              <div
                key={s.tipo}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{s.nombre}</p>
                  <p className="text-gray-500 text-sm">{formatCLP(s.precio)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decrementar(s.tipo)}
                    className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white w-5 text-center font-semibold">
                    {cantidades[s.tipo] || 0}
                  </span>
                  <button
                    onClick={() => incrementar(s.tipo)}
                    className="w-8 h-8 rounded-full text-white hover:opacity-80 transition-opacity flex items-center justify-center"
                    style={{ backgroundColor: '#E91E63' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resumen de precio */}
        {subtotal > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-green-400 text-sm">
                  <span>Descuento por volumen</span>
                  <span>−{formatCLP(descuento)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Despacho</span>
                <span className={despacho === 0 ? 'text-green-400 font-semibold' : ''}>
                  {despacho === 0 ? 'GRATIS' : formatCLP(despacho)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-700">
                <span className="text-white">Total</span>
                <span style={{ color: '#00BCD4' }}>{formatCLP(total)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapa (aparece cuando se verifica la dirección) */}
        {geo && (
          <div>
            <p className="text-gray-500 text-sm mb-2">Tu ubicación en el mapa:</p>
            <MapaCobertura userLat={geo.lat} userLon={geo.lon} />
          </div>
        )}

        {/* Errores y botón submit */}
        {submitError && (
          <p className="text-red-400 text-sm text-center">{submitError}</p>
        )}

        <Button
          onClick={enviarPedido}
          disabled={submitLoading || subtotal === 0}
          className="w-full text-white font-bold py-6 text-lg rounded-full disabled:opacity-40"
          style={{ backgroundColor: '#E91E63', border: 'none' }}
        >
          {submitLoading ? 'Enviando pedido...' : 'Confirmar Pedido →'}
        </Button>

        <p className="text-gray-600 text-xs text-center">
          ⚠️ No garantizamos eliminación de manchas de sangre, vino tinto ni aceite.
        </p>
      </div>
    </main>
  );
}
