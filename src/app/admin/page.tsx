import { PedidosTable } from '@/components/PedidosTable';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Panel Admin</h1>
          <p className="text-gray-600 text-sm">
            Express Delivery Wash — Gestión de pedidos
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <PedidosTable />
        </div>

        <p className="text-gray-800 text-xs text-center mt-6">
          Express Delivery Wash · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
