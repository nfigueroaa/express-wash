'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <section
      className="px-6 md:px-16 py-24 text-center"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <h2
          className="font-montserrat text-4xl md:text-5xl font-bold text-white leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          ¿Listo para liberar tu tiempo?
        </h2>
        <p
          className="font-inter text-base md:text-lg leading-relaxed"
          style={{ color: 'var(--indigo-text-muted)' }}
        >
          Únete a los profesionales que han delegado su lavandería a Express
          Wash. Tu primera recogida con descuento especial.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/pedido">
            <button
              className="rounded-full font-semibold px-8 py-4 text-base text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--indigo-btn)', border: 'none' }}
            >
              Hacer mi primer pedido
            </button>
          </Link>
          <button
            className="rounded-full px-8 py-4 text-base font-semibold transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1.5px solid #333',
              color: 'var(--indigo-primary-dim)',
            }}
            onClick={() => {
              const chatBtn = document.querySelector<HTMLButtonElement>(
                '[data-chatbot-trigger]',
              );
              chatBtn?.click();
            }}
          >
            Hablar con Washi 🤖
          </button>
        </div>
      </div>
    </section>
  );
}
