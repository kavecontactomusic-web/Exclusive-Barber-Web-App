import { useState, useEffect } from 'react';
import { Search, Star, ChevronRight, Loader2 } from 'lucide-react';
import { getBookings } from '../../services/bookings';
import { formatCOP } from '../../data';
import type { Booking } from '../../types';

interface Client {
  name: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
  favoriteService: string;
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
      });
    }
    const c = map.get(b.clientPhone)!;
    c.visits += 1;
    if (b.date > c.lastVisit) c.lastVisit = b.date;
    c.totalSpent += b.price;
  });
  return Array.from(map.values());
}

export default function AdminClients() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const clients = buildClients(bookings);
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

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
                {filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-white/2 transition-colors cursor-pointer group">
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
                      <ChevronRight size={16} className="text-zinc-700 group-hover:text-gold transition-colors" />
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
