import Image from 'next/image';

export function BentoGrid() {
  return (
    <section
      id="servicios"
      className="px-6 md:px-16 py-20"
      style={{ backgroundColor: 'var(--indigo-surface)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(192,193,255,0.08)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            Cuidado Especializado
          </span>
          <h2
            className="font-montserrat text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ letterSpacing: '-0.01em' }}
          >
            Para cada tipo de prenda
          </h2>
          <p
            className="font-inter text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Nuestra IA detecta el tipo de fibra y la mancha exacta para
            aplicar el tratamiento perfecto sin dañar tus telas.
          </p>
        </div>

        {/* Grid 1fr 2fr */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1 — Prendas Diarias (1 columna) */}
          <div
            className="md:col-span-1 flex flex-col rounded-[24px] overflow-hidden"
            style={{
              backgroundColor: 'var(--indigo-surface-2)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div className="relative h-48 w-full flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80"
                alt="Prendas diarias en perchas — Express Delivery Wash"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex flex-col gap-2 flex-grow">
              <h3
                className="font-montserrat text-lg font-semibold"
                style={{ color: 'var(--indigo-primary)' }}
              >
                Prendas Diarias
              </h3>
              <p
                className="font-inter text-sm leading-relaxed"
                style={{ color: 'var(--indigo-text-muted)' }}
              >
                Lavado, secado y doblado para tu ropa del día a día.
              </p>
            </div>
          </div>

          {/* Card 2 — Cubrecamas & Plumones (2 columnas) */}
          <div
            className="md:col-span-2 flex flex-col md:flex-row rounded-[24px] overflow-hidden"
            style={{
              backgroundColor: 'var(--indigo-surface-2)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div className="relative md:w-5/12 h-56 md:h-auto flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"
                alt="Cubrecamas y plumones limpios — Express Delivery Wash"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-center gap-4">
              <span
                className="inline-block px-3 py-1 rounded text-xs font-semibold w-fit"
                style={{
                  backgroundColor: 'rgba(0,66,100,0.5)',
                  color: 'var(--indigo-tertiary)',
                }}
              >
                Más Popular
              </span>
              <h3
                className="font-montserrat text-xl font-semibold"
                style={{ color: 'var(--indigo-primary)' }}
              >
                Cubrecamas &amp; Plumones
              </h3>
              <p
                className="font-inter text-sm leading-relaxed"
                style={{ color: 'var(--indigo-text-muted)' }}
              >
                Limpieza profunda con tecnología de ozono que elimina el
                99.9% de ácaros y alérgenos en piezas de gran volumen.
              </p>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--indigo-primary-dim)' }}
              >
                <span>✓</span>
                <span>Tratamiento de Plumón Natural</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
