import Image from 'next/image';

const features = [
  {
    icon: '🧠',
    iconBg: 'rgba(109,76,166,0.25)',
    title: 'AI-Driven Support',
    description:
      'Nuestro asistente Washi monitorea cada ciclo de lavado en tiempo real, garantizando que nunca se pierda un botón o se dañe un tejido delicado.',
  },
  {
    icon: '☁️',
    iconBg: 'rgba(0,66,100,0.35)',
    title: 'GCP Infrastructure',
    description:
      'Operamos sobre Google Cloud Platform para asegurar que tus pedidos y seguimiento estén siempre disponibles con una fiabilidad del 99.9%.',
  },
  {
    icon: '👆',
    iconBg: 'rgba(55,58,155,0.3)',
    title: 'Easy Ordering',
    description:
      'Pide tu servicio en 3 clicks. Sin formularios largos, sin llamadas. Todo desde la palma de tu mano con nuestra interfaz intuitiva.',
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      className="px-6 md:px-16 py-20"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Columna izquierda — features */}
        <div className="flex flex-col gap-10">
          <div>
            <span
              className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
              style={{
                background: 'rgba(192,193,255,0.08)',
                color: 'var(--indigo-primary-dim)',
              }}
            >
              Por qué elegirnos
            </span>
            <h2
              className="font-montserrat text-3xl md:text-4xl font-bold text-white leading-tight"
              style={{ letterSpacing: '-0.01em' }}
            >
              La pureza tecnológica<br />de Express Wash
            </h2>
          </div>

          {features.map((feature) => (
            <div key={feature.title} className="flex gap-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: feature.iconBg }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  className="font-montserrat text-base font-semibold text-white mb-1"
                >
                  {feature.title}
                </h3>
                <p
                  className="font-inter text-sm leading-relaxed"
                  style={{ color: 'var(--indigo-text-muted)' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Columna derecha — imagen */}
        <div
          className="relative rounded-[28px] overflow-hidden aspect-video"
          style={{
            border: '1px solid var(--indigo-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80"
            alt="Instalación moderna de lavandería tecnológica"
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(21,21,125,0.35), transparent)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
