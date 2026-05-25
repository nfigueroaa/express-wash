/**
 * Layout para /admin/login
 * No verifica sesión — permite que la página de login se renderice sin redirecciones.
 * Sobreescribe el layout padre que verificaría la sesión.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
