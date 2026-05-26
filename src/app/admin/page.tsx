import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--indigo-primary)', fontFamily: 'Montserrat, sans-serif' }}
        >
          Pedidos
        </h1>
        <p className="text-sm" style={{ color: '#555' }}>
          Gestión de pedidos en tiempo real
        </p>
      </div>

      <AdminDashboard />
    </>
  );
}
