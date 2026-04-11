import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { getOccupiedSlotsForBarberAndDate } from '../../services/bookings';
import { getSchedule } from '../../services/schedule';
import type { DaySchedule } from '../../services/schedule';

interface Props {
  barberId: string;
  selectedDate: string;
  selectedTime: string;
  serviceDuration: number;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Hora actual en Colombia (UTC-5) expresada en minutos desde medianoche
function getCurrentMinutesColombia(): number {
  const now = new Date();
  // Colombia es UTC-5
  const colombiaOffset = -5 * 60; // minutos
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const colombiaMinutes = (utcMinutes + colombiaOffset + 24 * 60) % (24 * 60);
  return colombiaMinutes;
}

// Fecha de hoy en Colombia
function getTodayLocalColombia(): string {
  const now = new Date();
  const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const year = colombiaTime.getUTCFullYear();
  const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(colombiaTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSlots(
  date: string,
  occupiedSlots: { time: string; duration: number }[],
  serviceDuration: number,
  schedule: DaySchedule[]
): { time: string; available: boolean }[] {
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
  const daySchedule = schedule.find((s) => s.day_of_week === dayOfWeek);

  if (!daySchedule || !daySchedule.is_open) return [];

  const slots = [];
  const todayColombia = getTodayLocalColombia();
  const isToday = date === todayColombia;
  const currentMinutes = getCurrentMinutesColombia();

  const openMinutes = timeToMinutes(daySchedule.open_time);
  const closeMinutes = timeToMinutes(daySchedule.close_time);
  const lunchStart = daySchedule.lunch_start ? timeToMinutes(daySchedule.lunch_start) : null;
  const lunchEnd = daySchedule.lunch_end ? timeToMinutes(daySchedule.lunch_end) : null;

  for (let minutes = openMinutes; minutes < closeMinutes; minutes += 15) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    const slotStart = minutes;
    const slotEnd = slotStart + serviceDuration;

    // Slot pasado: solo bloquear si la hora de inicio ya pasó en Colombia
    const isPast = isToday && slotStart <= currentMinutes;
    // Excede cierre: el servicio terminaría después del cierre
    const exceedsClosing = slotEnd > closeMinutes;
    const crossesLunch = lunchStart !== null && lunchEnd !== null &&
      slotStart < lunchEnd && slotEnd > lunchStart;
    const isOccupied = occupiedSlots.some(({ time, duration }) => {
      const bookedStart = timeToMinutes(time);
      const bookedEnd = bookedStart + duration;
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });

    slots.push({
      time: timeStr,
      available: !isPast && !exceedsClosing && !crossesLunch && !isOccupied,
    });
  }

  return slots;
}

export default function Step3DateTime({ barberId, selectedDate, selectedTime, serviceDuration, onSelect, onBack }: Props) {
  const dates = getDates(14);
  const [tempDate, setTempDate] = useState(selectedDate || toLocalISO(dates[0]));
  const [tempTime, setTempTime] = useState(selectedTime);
  const [occupiedSlots, setOccupiedSlots] = useState<{ time: string; duration: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    getSchedule().then(setSchedule);
  }, []);

  useEffect(() => {
    if (!tempDate || !barberId) return;
    setLoadingSlots(true);
    getOccupiedSlotsForBarberAndDate(barberId, tempDate)
      .then(setOccupiedSlots)
      .finally(() => setLoadingSlots(false));
  }, [tempDate, barberId]);

  const slots = generateSlots(tempDate, occupiedSlots, serviceDuration, schedule);

  const handleContinue = () => {
    if (tempDate && tempTime) {
      onSelect(tempDate, tempTime);
    }
  };

  // Verificar si el día está cerrado
  const dateObj = new Date(tempDate + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
  const daySchedule = schedule.find((s) => s.day_of_week === dayOfWeek);
  const isDayClosed = daySchedule && !daySchedule.is_open;

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
          const dow = d.getDay();
          const daySched = schedule.find((s) => s.day_of_week === dow);
          const closed = daySched && !daySched.is_open;

          return (
            <button
              key={iso}
              onClick={() => { setTempDate(iso); setTempTime(''); }}
              className={`flex flex-col items-center px-3 py-3 rounded-xl border shrink-0 min-w-[56px] transition-all ${
                closed
                  ? 'border-white/5 opacity-40 cursor-not-allowed'
                  : isSelected
                  ? 'border-gold bg-gold/15 shadow-gold'
                  : 'border-white/8 glass hover:border-white/20'
              }`}
              disabled={!!closed}
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
              {isToday && <span className="w-1 h-1 rounded-full bg-gold mt-1" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs text-zinc-500 uppercase tracking-wider">Horarios disponibles</h4>
        <span className="text-xs text-zinc-600">{serviceDuration} min por turno</span>
      </div>

      {loadingSlots ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gold" />
        </div>
      ) : isDayClosed ? (
        <p className="text-zinc-500 text-sm text-center py-8">Este día está cerrado</p>
      ) : slots.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">No hay horarios disponibles para este día</p>
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