import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { getBookings, updateBookingStatus, deleteBooking } from '../../services/bookings';
import { formatCOP } from '../../data';
import type { Booking } from '../../types';

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getBookings()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter((b) => {
    const matchSearch = b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const changeStatus = async (id: string, newStatus: Booking['status']) => {
    setList((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
    await updateBookingStatus(id, newStatus);
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (!confirm(`¿Eliminar la reserva de ${clientName}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    try {
      await deleteBooking(id);
      setList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert('Error al eliminar la reserva. Intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    const header = ['ID', 'Cliente', 'Teléfono', 'Servicio', 'Barbero', 'Fecha', 'Hora', 'Total', 'Estado'];
    const rows = filtered.map((b) => [
      b.id,
      b.clientName,
      b.clientPhone,
      b.serviceName,
      b.barberName,
      b.date,
      b.time,
      b.price,
      statusLabel[b.status],
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o servicio..."
            className="w-full pl-9 pr-4 py-2.5 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 bg-transparent"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none appearance-none bg-transparent cursor-pointer"
          >
            <option value="todos" className="bg-dark">Todos</option>
            <option value="pending" className="bg-dark">Pendientes</option>
            <option value="confirmed" className="bg-dark">Confirmadas</option>
            <option value="completed" className="bg-dark">Completadas</option>
            <option value="cancelled" className="bg-dark">Canceladas</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <Download size={14} />
          CSV
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
          <p className="text-zinc-400 text-xs">{filtered.length} reservas</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['ID', 'Cliente', 'Servicio', 'Barbero', 'Fecha', 'Hora', 'Total', 'Estado', 'Acción', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{b.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium text-sm whitespace-nowrap">{b.clientName}</p>
                        <p className="text-zinc-600 text-xs">{b.clientPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-sm whitespace-nowrap">{b.serviceName}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">{b.barberName}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm font-mono">{b.time}</td>
                    <td className="px-4 py-3 text-gold font-mono font-semibold">{formatCOP(b.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full status-${b.status}`}>
                        {statusLabel[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={b.status}
                          onChange={(e) => changeStatus(b.id, e.target.value as Booking['status'])}
                          className="text-xs px-2 py-1 glass border border-white/10 rounded-lg text-zinc-300 bg-transparent focus:outline-none cursor-pointer"
                        >
                          <option value="pending" className="bg-dark">Pendiente</option>
                          <option value="confirmed" className="bg-dark">Confirmar</option>
                          <option value="completed" className="bg-dark">Completar</option>
                          <option value="cancelled" className="bg-dark">Cancelar</option>
                          <option value="no-show" className="bg-dark">No asistió</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(b.id, b.clientName)}
                        disabled={deletingId === b.id}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                        title="Eliminar reserva"
                      >
                        {deletingId === b.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}