import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-black via-gray-950 to-black">
      <span
        className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-6"
        style={{ backgroundColor: '#E91E63' }}
      >
        🧺 Santiago, Chile
      </span>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
        Tu ropa limpia,
        <br />
        <span style={{ color: '#00BCD4' }}>sin salir de casa</span>
      </h1>

      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        Retiro y entrega a domicilio en Santiago. Cubrecamas, plumones, colchas y ropa
        en 24–48 horas. Sin esfuerzo, sin vueltas.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/pedido">
          <Button
            size="lg"
            className="text-white font-bold px-10 py-6 text-lg rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E91E63', border: 'none' }}
          >
            Hacer un pedido →
          </Button>
        </Link>
        <Link href="#servicios">
          <Button
            variant="outline"
            size="lg"
            className="px-10 py-6 text-lg rounded-full border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Ver servicios
          </Button>
        </Link>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row gap-6 text-center">
        {[
          { icon: '⚡', label: '24–48 hrs', sub: 'Entrega garantizada' },
          { icon: '🏠', label: 'A domicilio', sub: 'Retiro y entrega' },
          { icon: '📍', label: '15 km', sub: 'Radio de cobertura' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-2xl mb-1">{stat.icon}</span>
            <span className="text-white font-bold text-lg">{stat.label}</span>
            <span className="text-gray-500 text-sm">{stat.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
