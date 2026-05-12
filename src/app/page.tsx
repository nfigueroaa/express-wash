import { Hero } from '@/components/Hero';
import { ServiciosGrid } from '@/components/ServiciosGrid';
import { CalculadoraPedido } from '@/components/CalculadoraPedido';
import { MapaCobertura } from '@/components/MapaCobertura';
import { Footer } from '@/components/Footer';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiciosGrid />
      <CalculadoraPedido />
      <MapaCobertura />
      <Footer />
      <ChatbotWidget />
    </main>
  );
}
