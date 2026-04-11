import { useState, useEffect } from 'react';
import { Star, Calendar } from 'lucide-react';
import { getBarbers } from '../../services/barbers';
import type { Barber } from '../../types';

interface TeamProps {
  onBooking: () => void;
}

export default function Team({ onBooking }: TeamProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    getBarbers().then(setBarbers);
  }, []);

  return (
    <section id="equipo" className="py-24 relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, #1a1100 0%, transparent 60%)' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Nuestro Equipo</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Barberos <span className="gold-text">Expertos</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Maestros del corte con años de experiencia y pasión por el arte de la barbería.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.map((barber, i) => (
            <div
              key={barber.id}
              className="glass rounded-2xl p-7 card-hover border border-white/8 text-center group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative inline-block mb-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-dark shadow-gold-lg mx-auto"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
                >
                  {barber.avatar}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark ${
                    barber.available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>

              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                  barber.available ? 'status-available' : 'status-busy'
                }`}
              >
                {barber.available ? '● Disponible' : '● Ocupado'}
              </span>

              <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:text-gold transition-colors">
                {barber.name}
              </h3>

              <div className="flex items-center justify-center gap-1 mb-4">
                <Star size={13} className="text-gold fill-gold" />
                <span className="text-white font-mono font-semibold text-sm">{barber.rating}</span>
                <span className="text-zinc-500 text-xs">({barber.reviewCount} reseñas)</span>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                {barber.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs px-2.5 py-1 rounded-full glass border border-white/10 text-zinc-400"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{barber.bio}</p>

              <button
                onClick={onBooking}
                className="w-full btn-outline-gold py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={14} />
                Ver disponibilidad
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}