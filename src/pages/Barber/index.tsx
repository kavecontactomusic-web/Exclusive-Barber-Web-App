import { useState, useEffect } from 'react';
import { CalendarDays, Scissors, Clock, User, LogOut, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import BarberLogin from './BarberLogin';
import { getBookingsByBarberAndDate, getBookings, updateBookingStatus } from '../../services/bookings';
import { formatCOP } from '../../data';
import type { Barber, Booking } from '../../types';

type BarberTab = 'agenda' | 'servicios' | 'historial' | 'perfil';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completado',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getTodayColombia(): string {
  const now = new Date();
  const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const year = colombiaTime.getUTCFullYear();
  const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(colombiaTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentYearMonthColombia(): string {
  return getTodayColombia().slice(0, 7);
}

function getCurrentMonthIndexColombia(): number {
  const now = new Date();
  const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  return colombiaTime.getUTCMonth();
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(month) - 1]} ${year}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function BarberDashboard({ barber, onLogout }: { barber: Barber; onLogout: () => void }) {
  const [tab, setTab] = useState<BarberTab>('agenda');
  const [todayAppts, setTodayAppts] = useState<Booking[]>([]);
  const [allAppts, setAllAppts] = useState<Booking[]>([]);

  // Fecha seleccionada en historial
  const [selectedHistorialDate, setSelectedHistorialDate] = useState(getTodayColombia());
  const [historialDayAppts, setHistorialDayAppts] = useState<Booking[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const today = getTodayColombia();
  const currentYearMonth = getCurrentYearMonthColombia();
  const currentMonthName = MONTHS_ES[getCurrentMonthIndexColombia()];

  useEffect(() => {
    getBookingsByBarberAndDate(barber.id, today).then(setTodayAppts);
    getBookings().then((all) => setAllAppts(all.filter((b) => b.barberId === barber.id)));
  }, [barber.id, today]);

  // Cargar citas del día seleccionado en historial
  useEffect(() => {
    setLoadingHistorial(true);
    getBookingsByBarberAndDate(barber.id, selectedHistorialDate)
      .then(setHistorialDayAppts)
      .finally(() => setLoadingHistorial(false));
  }, [barber.id, selectedHistorialDate]);

  const completedToday = todayAppts.filter((b) => b.status === 'completed');
  const earningsToday = completedToday.reduce((s, b) => s + b.price, 0);
  const commissionToday = Math.round(earningsToday * barber.commission / 100);

  const monthAppts = allAppts.filter((b) => b.date.startsWith(currentYearMonth));
  const monthCompleted = monthAppts.filter((b) => b.status === 'completed');
  const monthEarnings = monthCompleted.reduce((s, b) => s + b.price, 0);
  const monthCommission = Math.round(monthEarnings * barber.commission / 100);

  // Stats del día seleccionado en historial
  const historialDayCompleted = historialDayAppts.filter((b) => b.status === 'completed');
  const historialDayEarnings = historialDayCompleted.reduce((s, b) => s + b.price, 0);
  const historialDayCommission = Math.round(historialDayEarnings * barber.commission / 100);

  const updateStatus = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status);
    setTodayAppts((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    setAllAppts((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  };

  const tabs: { id: BarberTab; label: string; icon: React.ElementType }[] = [
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
    { id: 'servicios', label: 'Servicios', icon: Scissors },
    { id: 'historial', label: 'Historial', icon: Clock },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  const nextAppt = todayAppts.find((b) => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'no-show');

  return (
    <div className="min-h-screen bg-dark flex flex-col max-w-2xl mx-auto">
      <header className="glass border-b border-white/8 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-dark"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
          >
            {barber.avatar}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{barber.name}</p>
            <p className="text-zinc-500 text-xs">{today}</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-zinc-500 hover:text-red-400 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'agenda' && (
          <div className="space-y-4">
            {nextAppt && (
              <div className="glass-gold rounded-2xl p-4 border border-gold/20">
                <p className="section-label text-[10px] mb-2">Próxima Cita</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{nextAppt.clientName}</p>
                    <p className="text-zinc-400 text-sm">{nextAppt.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-bold gold-text">{nextAppt.time}</p>
                    <p className="text-zinc-500 text-xs">{formatCOP(nextAppt.price)}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="section-label text-[10px] px-1">Citas de Hoy — {todayAppts.length} total</p>

            {todayAppts.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sin citas para hoy</p>
              </div>
            ) : (
              todayAppts.map((b) => (
                <div key={b.id} className="glass rounded-xl p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{b.clientName}</p>
                      <p className="text-zinc-400 text-xs">{b.serviceName} · {b.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold gold-text">{formatCOP(b.price)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full status-${b.status}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </div>
                  </div>
                  {b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'no-show' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="flex-1 py-2 bg-green-500/15 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-all"
                      >
                        Completado
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'no-show')}
                        className="flex-1 py-2 glass border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
                      >
                        No asistió
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'servicios' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 border border-white/8 text-center">
                <p className="font-mono text-2xl font-bold text-white">{completedToday.length}</p>
                <p className="text-zinc-500 text-xs mt-1">Servicios Hoy</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/8 text-center">
                <p className="font-mono text-lg font-bold gold-text">{formatCOP(earningsToday)}</p>
                <p className="text-zinc-500 text-xs mt-1">Facturado Hoy</p>
              </div>
              <div className="glass-gold rounded-xl p-4 border border-gold/20 text-center col-span-2">
                <p className="font-mono text-xl font-bold text-green-400">{formatCOP(commissionToday)}</p>
                <p className="text-zinc-400 text-xs mt-1">Tu comisión ({barber.commission}%) — Hoy</p>
              </div>
            </div>

            <p className="section-label text-[10px] px-1">Servicios Completados Hoy</p>
            {completedToday.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm">Sin servicios completados hoy</div>
            ) : (
              completedToday.map((b) => (
                <div key={b.id} className="glass rounded-xl p-4 border border-white/8 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium text-sm">{b.clientName}</p>
                    <p className="text-zinc-500 text-xs">{b.serviceName} · {b.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold gold-text">{formatCOP(b.price)}</p>
                    <p className="text-green-400 text-xs">+{formatCOP(Math.round(b.price * barber.commission / 100))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'historial' && (
          <div className="space-y-4">

            {/* Selector de día */}
            <div className="glass rounded-xl p-3 border border-white/8 flex items-center justify-between">
              <button
                onClick={() => setSelectedHistorialDate(addDays(selectedHistorialDate, -1))}
                className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">{formatDateLabel(selectedHistorialDate)}</p>
                {selectedHistorialDate === today && (
                  <p className="text-gold text-[10px]">Hoy</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (selectedHistorialDate < today) {
                    setSelectedHistorialDate(addDays(selectedHistorialDate, 1));
                  }
                }}
                disabled={selectedHistorialDate >= today}
                className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Stats del día seleccionado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3 text-center border border-white/8">
                <p className="font-mono text-2xl font-bold text-white">{historialDayCompleted.length}</p>
                <p className="text-zinc-500 text-xs">Completados</p>
              </div>
              <div className="glass rounded-xl p-3 text-center border border-white/8">
                <p className="font-mono text-sm font-bold gold-text">{formatCOP(historialDayEarnings)}</p>
                <p className="text-zinc-500 text-xs">Facturado</p>
              </div>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-green-500/20">
              <p className="font-mono text-lg font-bold text-green-400">{formatCOP(historialDayCommission)}</p>
              <p className="text-zinc-400 text-xs mt-0.5">Tu comisión ({barber.commission}%)</p>
            </div>

            {/* Resumen del mes */}
            <div className="glass-gold rounded-xl p-4 border border-gold/20 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-mono text-xl font-bold text-white">{monthCompleted.length}</p>
                <p className="text-zinc-500 text-xs">Total {currentMonthName}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-sm font-bold gold-text">{formatCOP(monthCommission)}</p>
                <p className="text-zinc-500 text-xs">Comisión mes</p>
              </div>
            </div>

            {/* Citas del día seleccionado */}
            <p className="section-label text-[10px] px-1">Citas del {formatDateLabel(selectedHistorialDate)}</p>
            {loadingHistorial ? (
              <div className="text-center py-8 text-zinc-600 text-sm">Cargando...</div>
            ) : historialDayAppts.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm">Sin citas este día</div>
            ) : (
              historialDayAppts.map((b) => (
                <div key={b.id} className="glass rounded-xl p-4 border border-white/8 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium text-sm">{b.clientName}</p>
                    <p className="text-zinc-500 text-xs">{b.time} · {b.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold gold-text">{formatCOP(b.price)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full status-${b.status}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-white/8 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-dark shadow-gold mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
              >
                {barber.avatar}
              </div>
              <h2 className="font-serif text-xl font-bold text-white mb-1">{barber.name}</h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star size={13} className="text-gold fill-gold" />
                <span className="text-white font-mono font-semibold">{barber.rating}</span>
                <span className="text-zinc-500 text-xs">({barber.reviewCount} reseñas)</span>
              </div>
              <p className="text-zinc-500 text-sm">{barber.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-4 text-center border border-white/8">
                <p className="font-mono text-xl font-bold text-white">{monthCompleted.length}</p>
                <p className="text-zinc-600 text-xs">Servicios</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-white/8">
                <p className="font-mono text-xs font-bold gold-text">{formatCOP(monthEarnings)}</p>
                <p className="text-zinc-600 text-xs">Ingresos</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-white/8">
                <p className="font-mono text-xl font-bold text-green-400">{barber.commission}%</p>
                <p className="text-zinc-600 text-xs">Comisión</p>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/8">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {barber.specialties.map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 glass-gold border border-gold/20 rounded-full text-gold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="glass border-t border-white/8 px-4 py-2 flex items-center justify-around shrink-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              tab === id ? 'text-gold' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function BarberPage() {
  const [loggedInBarber, setLoggedInBarber] = useState<Barber | null>(null);

  if (!loggedInBarber) {
    return <BarberLogin onLogin={setLoggedInBarber} />;
  }

  return <BarberDashboard barber={loggedInBarber} onLogout={() => setLoggedInBarber(null)} />;
}