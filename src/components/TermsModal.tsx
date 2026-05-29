'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function TermsModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-xs underline underline-offset-2 transition-opacity hover:opacity-80"
          style={{ color: 'var(--indigo-text-muted)' }}
        >
          Términos y Condiciones
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Términos y Condiciones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--indigo-text-muted)' }}>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>1. Servicio</h3>
            <p>Express Delivery Wash ofrece servicio de lavandería a domicilio en Santiago, Chile, dentro de un radio de 15 km desde el centro. El servicio incluye retiro, lavado, secado, doblado y entrega en tu dirección.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>2. Plazos de entrega</h3>
            <p>Los plazos estimados son: sábanas y ropa 24 horas, cubrecamas y colchas 24–48 horas, plumones 48–72 horas. Los plazos son referenciales y pueden variar por volumen de trabajo o causas de fuerza mayor.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>3. Política de manchas</h3>
            <p>No garantizamos la eliminación completa de manchas de sangre, vino tinto, aceite, grasa de cocina ni manchas antiguas (más de 7 días sin tratar). El servicio puede mejorar su aspecto, pero no asegurar su desaparición total. En estos casos no aplica reembolso por las manchas no eliminadas.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>4. Cancelación</h3>
            <p>Puedes cancelar tu pedido sin costo hasta 1 hora antes del horario de retiro coordinado. Cancelaciones posteriores o no-shows pueden quedar sujetas a un cargo mínimo de coordinación.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>5. Responsabilidad</h3>
            <p>Nos comprometemos a tratar cada prenda con cuidado. En caso de daño comprobable atribuible a nuestro proceso, la compensación máxima corresponde al valor del servicio pagado. No nos hacemos responsables por prendas con instrucciones de lavado no indicadas por el cliente.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>6. Precios y pago</h3>
            <p>Los precios mostrados en el sitio incluyen IVA y están expresados en pesos chilenos (CLP). El pago se realiza al momento de la entrega mediante transferencia bancaria o efectivo. Los precios son calculados y validados por nuestro servidor — no se aceptan modificaciones externas.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>7. Datos personales</h3>
            <p>Los datos recopilados (nombre, teléfono, dirección) son utilizados exclusivamente para coordinar la entrega del servicio. No compartimos tu información con terceros ni la usamos para fines publicitarios.</p>
          </section>

          <section>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--indigo-primary)' }}>8. Contacto</h3>
            <p>Para consultas, reclamos o sugerencias: WhatsApp +56 9 4274 9703 (solo mensajes) o a través del chatbot Washi en nuestro sitio web.</p>
          </section>

          <p className="text-xs pt-2" style={{ color: 'var(--indigo-text-muted)' }}>
            Última actualización: mayo 2026
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
