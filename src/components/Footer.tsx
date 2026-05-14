const WHATSAPP_URL =
  'https://wa.me/56942749703?text=' +
  encodeURIComponent('Hola! Quiero consultar sobre sus servicios de lavandería.');

export function Footer() {
  return (
    <footer
      className="border-t py-10 px-6 md:px-16"
      style={{
        backgroundColor: '#050508',
        borderColor: 'var(--indigo-border-2)',
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
          <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
            Lavandería a domicilio en Santiago, Chile.
            <br />
            Retiro y entrega en 24–48 horas.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 font-montserrat text-sm">
            Horarios
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
            Lunes a Viernes: 8:00 – 20:00
            <br />
            Sábado: 9:00 – 17:00
            <br />
            Domingo: Cerrado
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 font-montserrat text-sm">
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
          <p className="text-sm" style={{ color: '#444' }}>
            Cobertura: 15 km desde Santiago centro
          </p>
        </div>
      </div>

      <div
        className="text-center text-xs pt-6 border-t space-y-1"
        style={{ borderColor: '#111' }}
      >
        <p style={{ color: '#222' }}>
          © {new Date().getFullYear()} Express Delivery Wash · Santiago, Chile
        </p>
        <p style={{ color: '#333' }}>
          Desarrollada por{' '}
          <span className="font-semibold" style={{ color: '#444' }}>
            Nelson Figueroa Albarrán
          </span>{' '}
          · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
