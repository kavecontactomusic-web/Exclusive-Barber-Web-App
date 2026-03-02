import { useState, useEffect } from 'react';
import { Scissors, Delete, Loader2 } from 'lucide-react';
import { getBarbers } from '../../services/barbers';
import type { Barber } from '../../types';

interface Props {
  onLogin: (barber: Barber) => void;
}

export default function BarberLogin({ onLogin }: Props) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    getBarbers()
      .then(setBarbers)
      .finally(() => setLoadingBarbers(false));
  }, []);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => validatePin(newPin), 200);
    }
  };

  const validatePin = (p: string) => {
    if (!selectedBarber) return;
    if (p === selectedBarber.pin) {
      onLogin(selectedBarber);
    } else {
      setError('PIN incorrecto');
      setShake(true);
      setTimeout(() => { setPin(''); setError(''); setShake(false); }, 800);
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  if (!selectedBarber) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at 70% 30%, #1a1100 0%, #080808 70%)' }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-gold mx-auto mb-4">
              <Scissors size={24} className="text-dark" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-1">Portal Barbero</h1>
            <p className="text-zinc-500 text-sm">Selecciona tu perfil para continuar</p>
          </div>

          {loadingBarbers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-3">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarber(b)}
                  className="w-full glass rounded-2xl p-5 border border-white/8 hover:border-gold/30 transition-all text-left flex items-center gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-dark shrink-0 group-hover:ring-2 group-hover:ring-gold transition-all"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
                  >
                    {b.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{b.name}</p>
                    <p className="text-zinc-500 text-xs">{b.specialties.slice(0, 2).join(' · ')}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${b.available ? 'status-available' : 'status-busy'}`}>
                    {b.available ? 'Disponible' : 'Ocupado'}
                  </span>
                </button>
              ))}
            </div>
          )}

          <p className="text-center mt-6">
            <a href="/" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
              ← Volver al sitio
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 70% 30%, #1a1100 0%, #080808 70%)' }}
    >
      <div className="w-full max-w-xs">
        <button
          onClick={() => { setSelectedBarber(null); setPin(''); setError(''); }}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 mx-auto transition-colors"
        >
          ← Cambiar barbero
        </button>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-dark shadow-gold mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
          >
            {selectedBarber.avatar}
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">{selectedBarber.name}</h2>
          <p className="text-zinc-500 text-sm mt-1">Ingresa tu PIN de 4 dígitos</p>
        </div>

        <div className={`flex justify-center gap-4 mb-8 ${shake ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > i
                  ? 'bg-gold border-gold'
                  : 'border-zinc-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center mb-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="glass border border-white/10 rounded-2xl py-4 text-white text-xl font-mono font-semibold hover:border-gold/40 hover:bg-gold/5 transition-all active:scale-95"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="glass border border-white/10 rounded-2xl py-4 text-white text-xl font-mono font-semibold hover:border-gold/40 hover:bg-gold/5 transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="glass border border-white/10 rounded-2xl py-4 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            <Delete size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
