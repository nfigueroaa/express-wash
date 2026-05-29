'use client';

import { TermsModal } from './TermsModal';

const WHATSAPP_URL =
  'https://wa.me/56942749703?text=' +
  encodeURIComponent('Hola! Quiero consultar sobre sus servicios de lavandería.');

export function Footer() {
  return (
    <footer
      className="border-t py-10 px-6 md:px-16"
      style={{
        backgroundColor: 'var(--indigo-surface)',
        borderColor: 'var(--indigo-border)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3
            className="font-montserrat font-bold text-lg mb-3"
            style={{ color: 'var(--indigo-primary)' }}
          >
            Express Delivery Wash
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--indigo-text-muted)' }}>
            Lavandería a domicilio en Santiago, Chile.
            <br />
            Retiro y entrega en 24–48 horas.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 font-montserrat text-sm" style={{ color: 'var(--indigo-primary)' }}>
            Horarios
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--indigo-text-muted)' }}>
            Lunes a Viernes: 8:00 – 20:00
            <br />
            Sábado: 9:00 – 17:00
            <br />
            Domingo: Cerrado
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 font-montserrat text-sm" style={{ color: 'var(--indigo-primary)' }}>
            Contacto
          </h4>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm block mb-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--indigo-tertiary)' }}
          >
            💬 WhatsApp (solo mensajes)
          </a>
          <p className="text-sm" style={{ color: 'var(--indigo-text-muted)' }}>
            Cobertura: 15 km desde Santiago centro
          </p>
        </div>
      </div>

      <div
        className="text-center text-xs pt-6 border-t space-y-1"
        style={{ borderColor: 'var(--indigo-border)' }}
      >
        <p style={{ color: 'var(--indigo-text-muted)' }}>
          © {new Date().getFullYear()} Express Delivery Wash · Santiago, Chile
        </p>
        <p style={{ color: 'var(--indigo-text-muted)' }}>
          Desarrollada por{' '}
          <span className="font-semibold" style={{ color: 'var(--indigo-primary-dim)' }}>
            Nelson Figueroa Albarrán
          </span>{' '}
          · {new Date().getFullYear()}
        </p>
        <p>
          <TermsModal />
        </p>
      </div>
    </footer>
  );
}
