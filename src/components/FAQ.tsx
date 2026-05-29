'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ_ITEMS = [
  {
    id: 'coverage',
    question: '¿Cuál es la cobertura geográfica?',
    answer:
      'Cubrimos una zona de 15 km desde Santiago centro (-33.4489, -70.6693). Si tu dirección está dentro de este rango, podemos atenderte. El despacho tiene un costo base de $2.000 + $500 por km, pero es GRATIS en pedidos sobre $30.000.',
  },
  {
    id: 'time',
    question: '¿Cuánto tiempo toma lavar mi ropa?',
    answer:
      'El tiempo depende del servicio: Sábanas y ropa regular: 24 horas. Cubrecamas y colchas: 24-48 horas. Plumones (proceso especial): 48-72 horas. Retiramos en la franja horaria que coordines y entregamos dentro del plazo.',
  },
  {
    id: 'payment',
    question: '¿Cómo pago?',
    answer:
      'Aceptamos transferencia bancaria o efectivo al momento de la entrega. Si necesitas factura con RUT de empresa, consulta directamente vía WhatsApp.',
  },
  {
    id: 'cancellation',
    question: '¿Puedo cancelar mi pedido?',
    answer:
      'Sí, puedes cancelar sin costo hasta 1 hora antes del horario de retiro coordinado. Si cancelas después, habla directamente con nuestro equipo.',
  },
  {
    id: 'stains',
    question: '¿Qué pasa con manchas difíciles?',
    answer:
      'No garantizamos la eliminación de manchas de sangre, vino tinto, aceite, grasa o manchas antiguas (más de 7 días sin tratar). Hacemos lo posible, pero pueden no desaparecer completamente. Si tienes una mancha específica, consulta antes de enviar.',
  },
  {
    id: 'same-day',
    question: '¿Puedo pedir el mismo día?',
    answer:
      'Sí, es posible si realizas el pedido antes de las 10:00 AM. Nos coordinamos contigo para fijar una franja horaria de retiro el mismo día.',
  },
  {
    id: 'babies',
    question: '¿Lavan ropa de bebés o pieles sensibles?',
    answer:
      'Sí, lavamos ropa delicada. Podemos usar un detergente neutro opcional para pieles sensibles. Consulta en el formulario si lo necesitas.',
  },
  {
    id: 'confirmation',
    question: '¿Cómo confirmo que recibieron mi ropa?',
    answer:
      'Enviamos una foto por WhatsApp cuando entregamos tu ropa limpia en tu domicilio. También te confirmaremos por el mismo medio cuando la retiremos.',
  },
];

export function FAQ() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-100 mb-3">
            Preguntas Frecuentes
          </h2>
          <p className="text-indigo-300/80 text-lg">
            Resuelve tus dudas sobre nuestro servicio
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border border-indigo-500/30 rounded-lg px-4 bg-indigo-950/20 hover:bg-indigo-950/40 transition-colors"
            >
              <AccordionTrigger className="text-indigo-100 hover:text-indigo-300 font-semibold py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-indigo-200/90 leading-relaxed pt-2">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-lg border border-indigo-500/30 bg-indigo-950/20 text-center">
          <p className="text-indigo-200 mb-3">¿No encontraste tu respuesta?</p>
          <p className="text-indigo-300/80">
            Chatea con Washi (esquina inferior derecha) o contáctanos vía WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}
