import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section
      className="relative px-6 md:px-16 py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      {/* Decoración fondo */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full -z-10 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 80% 50%, rgba(21,21,125,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Columna izquierda — texto */}
        <div>
          {/* Badge IA */}
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(192,193,255,0.08)',
              border: '1px solid var(--indigo-border)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            ✦ Impulsado por Google Cloud AI
          </span>

          {/* Título */}
          <h1
            className="font-montserrat text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5"
            style={{ letterSpacing: '-0.02em' }}
          >
            Tu Lavandería,{' '}
            <br />
            <span style={{ color: 'var(--indigo-primary)' }}>
              Reimaginada por IA
            </span>
          </h1>

          {/* Subtítulo */}
          <p
            className="font-inter text-base md:text-lg leading-relaxed mb-8 max-w-lg"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Experimenta el futuro del cuidado textil. Recogemos y entregamos
            tus prendas, cubrecamas y plumones con precisión quirúrgica y
            suavidad algodonosa — en 24 a 48 horas.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap gap-3">
            <Link href="/pedido">
              <Button
                size="lg"
                className="rounded-full font-semibold px-8 py-6 text-base text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--indigo-btn)', border: 'none' }}
              >
                Hacer mi Pedido
              </Button>
            </Link>
            <Link href="#cobertura">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base transition-colors"
                style={{
                  borderColor: '#333',
                  color: 'var(--indigo-primary-dim)',
                  backgroundColor: 'transparent',
                }}
              >
                Ver Cobertura
              </Button>
            </Link>
          </div>
        </div>

        {/* Columna derecha — imagen */}
        <div className="relative">
          <div
            className="relative w-full aspect-square rounded-[32px] overflow-hidden"
            style={{
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80"
              alt="Ropa blanca perfectamente plegada — Express Delivery Wash"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Badge flotante */}
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              backgroundColor: 'var(--indigo-surface)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: 'rgba(0,66,100,0.4)' }}
            >
              🚚
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Recogida Express</p>
              <p className="text-xs" style={{ color: 'var(--indigo-text-faint)' }}>
                En menos de 60 min
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
