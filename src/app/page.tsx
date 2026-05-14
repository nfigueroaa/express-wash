import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { CalculadoraPedido } from '@/components/CalculadoraPedido';
import { FeaturesSection } from '@/components/FeaturesSection';
import { PricingCards } from '@/components/PricingCards';
import { MapaCobertura } from '@/components/MapaCobertura';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function Home() {
  return (
    <main>
      <Hero />
      <BentoGrid />
      <FeaturesSection />
      <PricingCards />
      <CalculadoraPedido />
      <MapaCobertura />
      <CTASection />
      <Footer />
      <ChatbotWidget />
    </main>
  );
}
