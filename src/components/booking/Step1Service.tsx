import { useState, useEffect } from 'react';
import { Search, Clock, Check, Loader2 } from 'lucide-react';
import { getServices } from '../../services/services';
import { formatCOP } from '../../data';
import type { Service } from '../../types';

const categoryColors: Record<string, string> = {
  cortes: 'bg-blue-500/15 text-blue-400',
  barba: 'bg-amber-500/15 text-amber-400',
  tratamientos: 'bg-emerald-500/15 text-emerald-400',
  depilacion: 'bg-rose-500/15 text-rose-400',
  masajes: 'bg-cyan-500/15 text-cyan-400',
  cejas: 'bg-violet-500/15 text-violet-400',
};

interface Props {
  selected: Service | null;
  onSelect: (s: Service) => void;
}

export default function Step1Service({ selected, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h3 className="font-serif text-2xl font-bold text-white mb-1">Elige tu servicio</h3>
      <p className="text-zinc-500 text-sm mb-5">Selecciona el servicio que deseas reservar</p>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                selected?.id === service.id
                  ? 'border-gold/50 bg-gold/10'
                  : 'border-white/8 glass hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected?.id === service.id ? 'bg-gold/20' : 'bg-white/5'
              }`}>
                {selected?.id === service.id ? (
                  <Check size={16} className="text-gold" />
                ) : (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${categoryColors[service.category] || 'text-zinc-400'}`}>
                    {service.category.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-medium text-sm">{service.name}</span>
                  {service.popular && (
                    <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">Popular</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Clock size={11} />
                  <span>{service.duration} min</span>
                  <span>·</span>
                  <span className={`px-1.5 py-0.5 rounded capitalize ${categoryColors[service.category] || 'text-zinc-400'}`}>
                    {service.category}
                  </span>
                </div>
              </div>

              <span className="font-mono font-bold gold-text text-base shrink-0">
                {formatCOP(service.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
