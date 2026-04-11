import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBookingsByDate } from '../../services/bookings';
import { getBarbers } from '../../services/barbers';
import type { Booking, Barber } from '../../types';

type ViewMode = 'day' | 'week';

const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const statusColors: Record<string, string> = {
  pending: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  confirmed: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  completed: 'border-green-500/50 bg-green-500/10 text-green-300',
  cancelled: 'border-red-500/50 bg-red-500/5 text-red-400 line-through',
  'no-show': 'border-red-500/30 bg-red-500/5 text-red-500',
};

function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function AdminCalendar() {
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [weekBookings, setWeekBookings] = useState<Record<string, Booking[]>>({});
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    getBarbers().then(setBarbers);
  }, []);

  useEffect(() => {
    if (view === 'day') {
      getBookingsByDate(currentDate).then(setDayBookings);
    } else {
      const dates = getWeekDates(currentDate);
      Promise.all(dates.map((d) => getBookingsByDate(d).then((b) => [d, b] as [string, Booking[]]))).then((results) => {
        const map: Record<string, Booking[]> = {};
        results.forEach(([d, b]) => { map[d] = b; });
        setWeekBookings(map);
      });
    }
  }, [currentDate, view]);

  const navigateDate = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === 'week' ? delta * 7 : delta));
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const weekDates = getWeekDates(currentDate);
  const today = new Date().toISOString().split('T')[0];

  const formatDateLabel = () => {
    if (view === 'day') return currentDate;
    const first = weekDates[0];
    const last = weekDates[6];
    return `${first} — ${last}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex glass rounded-xl overflow-hidden border border-white/10">
          {(['day', 'week'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm transition-all ${
                view === v ? 'bg-gold/20 text-gold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {v === 'day' ? 'Día' : 'Semana'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-2 border border-white/10">
          <button onClick={() => navigateDate(-1)} className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white text-sm font-medium">{formatDateLabel()}</span>
          <button onClick={() => navigateDate(1)} className="text-zinc-500 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(today)}
          className="px-3 py-2 glass rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
        >
          Hoy
        </button>
      </div>

      {view === 'day' ? (
        <div className="glass rounded-2xl border border-white/8 overflow-hidden">
          <div
            className="grid border-b border-white/8"
            style={{ gridTemplateColumns: `64px repeat(${barbers.length || 3}, 1fr)` }}
          >
            <div className="p-3" />
            {barbers.map((b) => (
              <div key={b.id} className="p-3 border-l border-white/8 text-center">
                <p className="text-white text-sm font-medium">{b.shortName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.available ? 'status-available' : 'status-busy'}`}>
                  {b.available ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-white/5"
                style={{ gridTemplateColumns: `64px repeat(${barbers.length || 3}, 1fr)`, minHeight: '60px' }}
              >
                <div className="p-3 text-zinc-600 text-xs font-mono">{hour}</div>
                {barbers.map((barber) => {
                  const slot = dayBookings.find(
                    (b) => b.barberId === barber.id && b.time.startsWith(hour.slice(0, 2))
                  );
                  return (
                    <div key={barber.id} className="border-l border-white/5 p-1.5 relative">
                      {slot && (
                        <div className={`rounded-lg border px-2.5 py-2 text-xs ${statusColors[slot.status] || 'border-white/20 text-zinc-300'}`}>
                          <p className="font-semibold truncate">{slot.clientName}</p>
                          <p className="opacity-70 truncate">{slot.serviceName}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/8 overflow-hidden overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-8 border-b border-white/8">
              <div className="p-3" />
              {weekDates.map((d, i) => {
                const isToday = d === today;
                const dayNum = new Date(d).getDate();
                return (
                  <div key={d} className={`p-3 border-l border-white/8 text-center ${isToday ? 'bg-gold/5' : ''}`}>
                    <p className={`text-xs font-medium ${isToday ? 'text-gold' : 'text-zinc-500'}`}>{DAYS_ES[i]}</p>
                    <p className={`text-lg font-bold font-mono ${isToday ? 'text-gold' : 'text-white'}`}>{dayNum}</p>
                    <p className={`text-[10px] ${isToday ? 'text-gold/60' : 'text-zinc-700'}`}>
                      {(weekBookings[d] || []).length} citas
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="overflow-y-auto max-h-[480px]">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-white/5" style={{ minHeight: '56px' }}>
                  <div className="p-3 text-zinc-600 text-xs font-mono">{hour}</div>
                  {weekDates.map((d, i) => {
                    const isToday = d === today;
                    const daySlots = (weekBookings[d] || []).filter((b) => b.time.startsWith(hour.slice(0, 2)));
                    return (
                      <div key={i} className={`border-l border-white/5 p-1 space-y-1 ${isToday ? 'bg-gold/3' : ''}`}>
                        {daySlots.map((slot) => (
                          <div key={slot.id} className={`rounded border px-1.5 py-1 text-[10px] ${statusColors[slot.status] || 'border-white/20 text-zinc-300'}`}>
                            <p className="font-semibold truncate leading-tight">{slot.clientName}</p>
                            <p className="opacity-60 truncate leading-tight">{slot.barberName}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'bg-amber-500/30', label: 'Pendiente' },
          { color: 'bg-blue-500/30', label: 'Confirmada' },
          { color: 'bg-green-500/30', label: 'Completada' },
          { color: 'bg-red-500/20', label: 'Cancelada' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}