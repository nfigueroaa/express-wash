const WHATSAPP_URL = 'https://wa.me/56942749703?text=' + encodeURIComponent('Hola! Quiero consultar sobre sus servicios de lavandería.');

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3" style={{ color: '#E91E63' }}>
            Express Delivery Wash
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lavandería a domicilio en Santiago, Chile.<br />
            Retiro y entrega en 24–48 horas.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Horarios</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lunes a Viernes: 8:00 – 20:00<br />
            Sábado: 9:00 – 17:00<br />
            Domingo: Cerrado
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Contacto</h4>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 text-sm block mb-2 transition-colors"
          >
            💬 WhatsApp (solo mensajes)
          </a>
          <p className="text-gray-500 text-sm">
            Cobertura: 15 km desde Santiago centro
          </p>
        </div>
      </div>

      <div className="text-center text-gray-700 text-xs mt-8 pt-6 border-t border-gray-900 space-y-2">
        <p>© {new Date().getFullYear()} Express Delivery Wash · Santiago, Chile</p>
        <p className="text-gray-600">
          Desarrollada por <span className="font-semibold text-gray-400">Nelson Figueroa Albarrán</span> · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
