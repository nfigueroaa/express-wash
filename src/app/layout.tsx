import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Express Delivery Wash — Lavandería a domicilio Santiago',
  description:
    'Retiro y entrega de ropa a domicilio en Santiago, Chile. Cubrecamas, plumones, colchas y más en 24–48 horas. Sin salir de casa.',
  keywords: 'lavandería, domicilio, Santiago, Chile, cubrecamas, plumones, retiro, entrega',
  openGraph: {
    title: 'Express Delivery Wash',
    description: 'Lavandería a domicilio en Santiago — retiro y entrega 24–48 hrs',
    type: 'website',
    locale: 'es_CL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${montserrat.variable} font-inter antialiased`}
        style={{ backgroundColor: 'var(--indigo-bg)', color: '#ffffff' }}
      >
        {children}
      </body>
    </html>
  );
}
