import Link from 'next/link';

const plans = [
  {
    name: 'Essential',
    price: '$15.990',
    period: '/ bolsa',
    featured: false,
    queryParam: 'essential',
    features: [
      'Hasta 8kg de ropa diaria',
      'Lavado y secado estándar',
      'Doblado automático',
    ],
  },
  {
    name: 'Confort XL',
    price: '$24.990',
    period: '/ pack',
    featured: true,
    queryParam: 'confort',
    features: [
      '2 Plumones o Cubrecamas',
      'Tratamiento Hipoalergénico',
      'Entrega en bolsa al vacío',
      'Recogida Prioritaria',
    ],
  },
  {
    name: 'Deluxe AI',
    price: '$39.990',
    period: '/ mes',
    featured: false,
    queryParam: 'deluxe',
    features: [
      'Suscripción semanal (4 bolsas)',
      'Planchado a vapor manual',
      'Desmanchado inteligente',
    ],
  },
] as const;

export function PricingCards() {
  return (
    <section className="px-6 md:px-16 py-12">
      <div
        className="max-w-6xl mx-auto rounded-[40px] px-8 md:px-12 py-14"
        style={{
          backgroundColor: 'var(--indigo-surface-2)',
          border: '1px solid var(--indigo-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(192,193,255,0.08)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            Precios
          </span>
          <h2
            className="font-montserrat text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ letterSpacing: '-0.01em' }}
          >
            Precios Transparentes
          </h2>
          <p
            className="font-inter text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Sin sorpresas ni cargos ocultos. El precio que ves es el que
            pagas por el cuidado de tus prendas.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[24px] p-7 ${
                plan.featured ? 'md:-translate-y-3' : ''
              }`}
              style={{
                backgroundColor: plan.featured
                  ? 'var(--indigo-surface)'
                  : 'rgba(255,255,255,0.04)',
                border: plan.featured
                  ? '2px solid var(--indigo-lavender)'
                  : '1px solid var(--indigo-border)',
                boxShadow: plan.featured
                  ? '0 24px 48px rgba(0,0,0,0.4)'
                  : 'none',
              }}
            >
              {/* Nombre + badge */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-montserrat text-base font-semibold text-white">
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: 'var(--indigo-lavender)' }}
                  >
                    RECOMENDADO
                  </span>
                )}
              </div>

              {/* Precio */}
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span
                  className="text-sm ml-1"
                  style={{ color: 'var(--indigo-text-faint)' }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-grow mb-7">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm font-inter"
                    style={{ color: 'var(--indigo-text-muted)' }}
                  >
                    <span
                      style={{
                        color: plan.featured
                          ? 'var(--indigo-secondary)'
                          : 'var(--indigo-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <Link href={`/pedido?plan=${plan.queryParam}`}>
                <button
                  className="w-full py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
                  style={
                    plan.featured
                      ? {
                          backgroundColor: '#E91E63',
                          color: '#ffffff',
                          border: 'none',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--indigo-primary-dim)',
                          border: '1.5px solid #333',
                        }
                  }
                >
                  Seleccionar
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
