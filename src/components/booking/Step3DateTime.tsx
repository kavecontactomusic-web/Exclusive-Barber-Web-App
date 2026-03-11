import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { getOccupiedSlotsForBarberAndDate } from '../../services/bookings';

interface Props {
  barberId: string;
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ✅ Función corregida: usa fecha local en vez de UTC
function toLocalISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayLocal(): string {
  return toLocalISO(new Date());
}

function getDates(count: number) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function generateSlots(date: string, occupiedTimes: string[]): { time: string; available: boolean }[] {
  const slots = [];
  const today = getTodayLocal();
  const isToday = date === today;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const occupied = occupiedTimes.includes(timeStr);
      const isPast = isToday && (hour < currentHour || (hour === currentHour && min <= currentMin));
      slots.push({ time: timeStr, available: !occupied && !isPast });
    }
  }
  return slots;
}

export default function Step3DateTime({ barberId, selectedDate, selectedTime, onSelect, onBack }: Props) {
  const dates = getDates(14);
  const [tempDate, setTempDate] = useState(selectedDate || toLocalISO(dates[0]));
  const [tempTime, setTempTime] = useState(selectedTime);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!tempDate || !barberId) return;
    setLoadingSlots(true);
    getOccupiedSlotsForBarberAndDate(barberId, tempDate)
      .then(setOccupiedTimes)
      .finally(() => setLoadingSlots(false));
  }, [tempDate, barberId]);

  const slots = generateSlots(tempDate, occupiedTimes);

  const handleContinue = () => {
    if (tempDate && tempTime) {
      onSelect(tempDate, tempTime);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white text-sm mb-4 transition-colors">
        <ChevronLeft size={15} />
        Volver
      </button>

      <h3 className="font-serif text-2xl font-bold text-white mb-1">Fecha y hora</h3>
      <p className="text-zinc-500 text-sm mb-5">Elige cuándo quieres tu cita</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {dates.map((d) => {
          const iso = toLocalISO(d);
          const isSelected = tempDate === iso;
          const isToday = iso === getTodayLocal();

          return (
            <button
              key={iso}
              onClick={() => { setTempDate(iso); setTempTime(''); }}
              className={`flex flex-col items-center px-3 py-3 rounded-xl border shrink-0 min-w-[56px] transition-all ${
                isSelected
                  ? 'border-gold bg-gold/15 shadow-gold'
                  : 'border-white/8 glass hover:border-white/20'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-gold' : 'text-zinc-500'}`}>
                {DAYS_ES[d.getDay()]}
              </span>
              <span className={`text-lg font-bold font-mono ${isSelected ? 'text-gold' : 'text-white'}`}>
                {d.getDate()}
              </span>
              <span className={`text-[10px] ${isSelected ? 'text-gold/70' : 'text-zinc-600'}`}>
                {MONTHS_ES[d.getMonth()]}
              </span>
              {isToday && (
                <span className="w-1 h-1 rounded-full bg-gold mt-1" />
              )}
            </button>
          );
        })}
      </div>

      <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Horarios disponibles</h4>

      {loadingSlots ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
          {slots.map(({ time, available }) => (
            <button
              key={time}
              disabled={!available}
              onClick={() => available && setTempTime(time)}
              className={`py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                !available
                  ? 'border-white/5 text-zinc-700 line-through cursor-not-allowed'
                  : tempTime === time
                  ? 'border-gold bg-gold/15 text-gold shadow-gold'
                  : 'border-white/10 text-zinc-300 hover:border-gold/40 hover:text-gold glass'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      <button
        disabled={!tempDate || !tempTime}
        onClick={handleContinue}
        className="w-full btn-gold py-3.5 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>{tempTime ? `Continuar con ${tempTime}` : 'Selecciona una hora'}</span>
      </button>
    </div>
  );
}