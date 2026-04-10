import { useState, useEffect } from 'react';
import { Star, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { getBarbers } from '../../services/barbers';
import type { Barber } from '../../types';

interface Props {
  selected: Barber | null;
  onSelect: (b: Barber | null) => void;
  onBack: () => void;
}

export default function Step2Barber({ selected, onSelect, onBack }: Props) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBarbers()
      .then(setBarbers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white text-sm mb-4 transition-colors">
        <ChevronLeft size={15} />
        Volver
      </button>

      <h3 className="font-serif text-2xl font-bold text-white mb-1">Elige tu barbero</h3>
      <p className="text-zinc-500 text-sm mb-5">Selecciona quién te atenderá</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-3">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => barber.available && onSelect(barber)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                !barber.available
                  ? 'border-white/5 opacity-50 cursor-not-allowed bg-white/2'
                  : selected?.id === barber.id
                  ? 'border-gold/50 bg-gold/10'
                  : 'border-white/8 glass hover:border-white/20'
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-dark ${
                    selected?.id === barber.id ? 'ring-2 ring-gold' : ''
                  }`}
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
                >
                  {barber.avatar}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark ${
                    barber.available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-medium text-sm">{barber.name}</span>
                  {selected?.id === barber.id && <Check size={13} className="text-gold" />}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Star size={11} className="text-gold fill-gold" />
                  <span className="text-xs text-white font-mono">{barber.rating}</span>
                  <span className="text-zinc-600 text-xs">({barber.reviewCount})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.slice(0, 2).map((s) => (
                    <span key={s} className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  barber.available ? 'status-available' : 'status-busy'
                }`}
              >
                {barber.available ? 'Disponible' : 'Ocupado'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}