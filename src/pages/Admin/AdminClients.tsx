import { useState, useEffect } from 'react';
import { Search, Star, Loader2, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBookings, deleteBooking } from '../../services/bookings';
import { supabase } from '../../lib/supabase';
import { formatCOP } from '../../data';
import type { Booking } from '../../types';

const PAGE_SIZE = 20;

interface Client {
  name: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
  favoriteService: string;
  bookingIds: string[];
}

function buildClients(bookings: Booking[]): Client[] {
  const map = new Map<string, Client>();
  bookings.forEach((b) => {
    if (!map.has(b.clientPhone)) {
      map.set(b.clientPhone, {
        name: b.clientName,
        phone: b.clientPhone,
        email: b.clientEmail || '',
        visits: 0,
        lastVisit: b.date,
        totalSpent: 0,
        favoriteService: b.serviceName,
        bookingIds: [],
      });
    }
    const c = map.get(b.clientPhone)!;
    c.visits += 1;
    c.bookingIds.push(b.id);
    if (b.date > c.lastVisit) c.lastVisit = b.date;
    c.totalSpent += b.price;
  });
  return Array.from(map.values());
}

interface EditForm {
  name: string;
  phone: string;
  email: string;
}

export default function AdminClients() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState<EditForm>({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [deletingPhone, setDeletingPhone] = useState<string | null>(null);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  // Resetear página al buscar
  useEffect(() => {
    setPage(1);
  }, [search]);

  const clients = buildClients(bookings);
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({ name: c.name, phone: c.phone, email: c.email });
  };

  const closeEdit = () => {
    setEditClient(null);
    setForm({ name: '', phone: '', email: '' });
  };

  const handleSave = async () => {
    if (!editClient) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          client_name: form.name,
          client_phone: form.phone,
          client_email: form.email,
        })
        .eq('client_phone', editClient.phone);
      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) =>
          b.clientPhone === editClient.phone
            ? { ...b, clientName: form.name, clientPhone: form.phone, clientEmail: form.email }
            : b
        )
      );
      closeEdit();
    } catch {
      alert('Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (c: Client) => {
    if (!confirm(`¿Eliminar a ${c.name} y todas sus reservas (${c.visits})? Esta acción no se puede deshacer.`)) return;
    setDeletingPhone(c.phone);
    try {
      await Promise.all(c.bookingIds.map((id) => deleteBooking(id)));
      setBookings((prev) => prev.filter((b) => b.clientPhone !== c.phone));
    } catch {
      alert('Error al eliminar el cliente. Intenta de nuevo.');
    } finally {
      setDeletingPhone(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-4 py-2.5 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 bg-transparent"
          />
        </div>
        <span className="text-zinc-500 text-sm">{filtered.length} clientes</span>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Cliente', 'Teléfono', 'Visitas', 'Última Visita', 'Total Gastado', 'Servicio Favorito', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map((c) => (
                    <tr key={c.phone} className="hover:bg-white/2 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{c.phone}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-white font-semibold">{c.visits}</span>
                          {c.visits >= 3 && <Star size={12} className="text-gold fill-gold" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{c.lastVisit}</td>
                      <td className="px-5 py-4 font-mono font-semibold gold-text">{formatCOP(c.totalSpent)}</td>
                      <td className="px-5 py-4 text-zinc-400 text-xs">{c.favoriteService}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-gold hover:bg-gold/10 transition-colors"
                            title="Editar cliente"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c)}
                            disabled={deletingPhone === c.phone}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                            title="Eliminar cliente"
                          >
                            {deletingPhone === c.phone
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-white/8 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">
                  Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          p === page
                            ? 'bg-gold/20 text-gold border border-gold/30'
                            : 'glass border border-white/10 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de edición */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Editar cliente</h2>
              <button onClick={closeEdit} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1.5 block">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-gold hover:bg-gold/90 rounded-xl text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}