import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRECIOS } from '@/lib/types';
import { formatCLP } from '@/lib/utils';

const ICONOS: Record<string, string> = {
  cubrecamas: '🛏️',
  plumones: '☁️',
  colchas: '🛋️',
  sabanas_ropa: '👕',
};

export function ServiciosGrid() {
  return (
    <section id="servicios" className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-gray-400 text-lg">
            Despacho <span className="text-green-400 font-semibold">GRATIS</span> en pedidos sobre{' '}
            <span className="text-white font-semibold">$30.000</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRECIOS.map((servicio) => (
            <Card
              key={servicio.tipo}
              className="bg-gray-900 border-gray-800 hover:border-pink-600 transition-all duration-200 hover:-translate-y-1"
            >
              <CardHeader className="pb-2">
                <div className="text-3xl mb-2">{ICONOS[servicio.tipo]}</div>
                <CardTitle className="text-white text-lg leading-tight">
                  {servicio.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2" style={{ color: '#00BCD4' }}>
                  {formatCLP(servicio.precio)}
                </p>
                <p className="text-gray-500 text-sm">{servicio.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl border border-yellow-800/50 bg-yellow-950/20 max-w-2xl mx-auto">
          <p className="text-yellow-400 text-sm text-center leading-relaxed">
            ⚠️ <strong>Aviso:</strong> No garantizamos la eliminación de manchas de sangre,
            vino tinto ni aceite. El lavado puede mejorar pero no asegurar su eliminación.
          </p>
        </div>
      </div>
    </section>
  );
}
