import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, XCircle, UserPlus, Star, FileText, ChevronDown, ChevronUp, Clock, Save, Loader2 } from 'lucide-react';
import { getBookings } from '../../services/bookings';
import { getBarbers } from '../../services/barbers';
import { getServices } from '../../services/services';
import { getMonthlyReports, generateMonthlyReport, getMonthName } from '../../services/monthlyReports';
import { getBusinessHours, updateBusinessHours } from '../../services/businessHours';
import { formatCOP } from '../../data';
import type { Booking, Barber, Service } from '../../types';
import type { MonthlyReport } from '../../services/monthlyReports';
import type { BusinessHour } from '../../services/businessHours';

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

const revenueData = [40, 65, 55, 80, 70, 90, 75, 95, 60, 85, 70, 100, 88, 72, 95, 80, 65, 90, 75, 100, 85, 70, 95, 80, 65, 88, 72, 95, 80, 90];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [showReports, setShowReports] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [showHours, setShowHours] = useState(false);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);

  useEffect(() => {
    getBookings().then(setBookings);
    getBarbers().then(setBarbers);
    getServices().then(setServices);
    getMonthlyReports().then(setReports);
    getBusinessHours().then(setHours);
  }, []);

  useEffect(() => {
    if (bookings.length === 0 || barbers.length === 0) return;
    const today = new Date();
    if (today.getDate() !== 1) return;

    const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    const alreadyExists = reports.some((r) => r.year === prevYear && r.month === prevMonth);

    if (!alreadyExists) {
      generateMonthlyReport(prevYear, prevMonth, bookings, barbers).then((report) => {
        setReports((prev) => [report, ...prev]);
      });
    }
  }, [bookings, barbers, reports]);

  const today = new Date().toISOString().split('T')[0];
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const todayBookings = bookings.filter((b) => b.date === today);
  const todayRevenue = todayBookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.price, 0);
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  // Barbero estrella calculado dinámicamente desde reservas reales
  const starBarber = barbers.reduce<Barber | null>((best, b) => {
    const bServices = bookings.filter(
      (x) => x.barberId === b.id && x.date.startsWith(currentYearMonth) && x.status === 'completed'
    ).length;
    const bestServices = best
      ? bookings.filter(
          (x) => x.barberId === best.id && x.date.startsWith(currentYearMonth) && x.status === 'completed'
        ).length
      : -1;
    return bServices > bestServices ? b : best;
  }, null);

  const starBarberServices = bookings.filter(
    (x) => x.barberId === starBarber?.id && x.date.startsWith(currentYearMonth) && x.status === 'completed'
  ).length;

  const kpis = [
    { label: 'Citas Hoy', value: String(todayBookings.length), sub: 'total programadas', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Ingresos Hoy', value: formatCOP(todayRevenue), sub: 'servicios completados', icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
    { label: 'Barbero Estrella', value: starBarber?.shortName ?? '—', sub: `${starBarberServices} servicios este mes`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Cancelaciones', value: String(cancelledCount), sub: 'total registradas', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Total Clientes', value: String(new Set(bookings.map((b) => b.clientPhone)).size), sub: 'clientes únicos', icon: UserPlus, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Total Reservas', value: String(bookings.length), sub: 'en el sistema', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  const popularServices = services.slice(0, 5).map((s, i) => ({
    ...s,
    count: bookings.filter((b) => b.serviceId === s.id).length || [45, 38, 32, 28, 22][i],
  }));
  const maxCount = Math.max(...popularServices.map((s) => s.count), 1);
  const maxRevenue = Math.max(...revenueData);
  const recentBookings = [...bookings].slice(0, 5);

  const handleGenerateManual = async () => {
    setGeneratingReport(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const report = await generateMonthlyReport(year, month, bookings, barbers);
      setReports((prev) => {
        const filtered = prev.filter((r) => !(r.year === year && r.month === month));
        return [report, ...filtered];
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleHourChange = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      await updateBusinessHours(hours);
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`glass rounded-2xl p-5 border ${kpi.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg.split(' ')[0]}`}>
                  <Icon size={18} className={kpi.color} />
                </div>
              </div>
              <p className={`font-mono text-2xl font-bold mb-0.5 ${kpi.color}`}>{kpi.value}</p>
              <p className="text-white text-xs font-medium">{kpi.label}</p>
              <p className="text-zinc-600 text-xs mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Ingresos – últimos 30 días</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Tendencia mensual</p>
            </div>
            <span className="text-xs font-mono text-gold glass-gold px-3 py-1.5 rounded-full border border-gold/20">
              {formatCOP(bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.price, 0))} total
            </span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {revenueData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${(val / maxRevenue) * 100}%`,
                    background: i === revenueData.length - 1
                      ? 'linear-gradient(to top, #D4AF37, #F5E8A1)'
                      : 'rgba(212,175,55,0.25)',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-zinc-700 text-[10px]">
            <span>Hace 30 días</span>
            <span>Hace 15 días</span>
            <span>Hoy</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/8">
          <h3 className="font-semibold text-white mb-5">Servicios Populares</h3>
          <div className="space-y-4">
            {popularServices.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-zinc-300 text-xs truncate mr-2">{s.name}</span>
                  <span className="text-xs font-mono text-gold shrink-0">{s.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <h3 className="font-semibold text-white">Reservas Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['ID', 'Cliente', 'Servicio', 'Barbero', 'Fecha', 'Hora', 'Estado', 'Total'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 text-zinc-500 text-xs font-mono">{b.id.slice(0, 8)}...</td>
                  <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{b.clientName}</td>
                  <td className="px-5 py-3 text-zinc-300 whitespace-nowrap">{b.serviceName}</td>
                  <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{b.barberName}</td>
                  <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{b.date}</td>
                  <td className="px-5 py-3 text-zinc-400 font-mono">{b.time}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium status-${b.status}`}>
                      {statusLabel[b.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gold font-mono font-semibold">{formatCOP(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas de barberos con comisiones calculadas dinámicamente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barbers.map((barber) => {
          const barberBookings = bookings.filter(
            (b) => b.barberId === barber.id &&
                   b.date.startsWith(currentYearMonth) &&
                   b.status === 'completed'
          );
          const realServices = barberBookings.length;
          const realEarnings = barberBookings.reduce((s, b) => s + b.price, 0);
          const barberCommission = Math.round(realEarnings * barber.commission / 100);
          const shopEarnings = realEarnings - barberCommission;

          return (
            <div key={barber.id} className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-dark shrink-0"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
                >
                  {barber.avatar}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{barber.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-gold fill-gold" />
                    <span className="text-xs text-zinc-400">{barber.rating}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <p className="font-mono text-lg font-bold text-white">{realServices}</p>
                  <p className="text-zinc-600 text-xs">Servicios</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="font-mono text-sm font-bold gold-text">{formatCOP(realEarnings)}</p>
                  <p className="text-zinc-600 text-xs">Facturado</p>
                </div>
                <div className="glass rounded-xl p-3 text-center border border-green-500/20">
                  <p className="font-mono text-sm font-bold text-green-400">{formatCOP(barberCommission)}</p>
                  <p className="text-zinc-600 text-xs">Barbero ({barber.commission}%)</p>
                </div>
                <div className="glass rounded-xl p-3 text-center border border-gold/20">
                  <p className="font-mono text-sm font-bold gold-text">{formatCOP(shopEarnings)}</p>
                  <p className="text-zinc-600 text-xs">Barbería ({100 - barber.commission}%)</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Horarios Editor */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div
          className="px-6 py-4 border-b border-white/8 flex items-center justify-between cursor-pointer"
          onClick={() => setShowHours(!showHours)}
        >
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gold" />
            <h3 className="font-semibold text-white">Horarios de Atención</h3>
          </div>
          {showHours ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </div>

        {showHours && (
          <div className="p-6">
            <p className="text-zinc-500 text-xs mb-5">Edita los horarios que verán tus clientes en la página web.</p>
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/8">
                  <span className="text-white text-sm font-medium w-24 shrink-0">{h.day}</span>

                  <label className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) => handleHourChange(i, 'closed', e.target.checked)}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-zinc-400 text-xs">Cerrado</span>
                  </label>

                  {!h.closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => handleHourChange(i, 'open', e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold/40 w-full"
                      />
                      <span className="text-zinc-600 text-xs shrink-0">hasta</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => handleHourChange(i, 'close', e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold/40 w-full"
                      />
                    </div>
                  )}

                  {h.closed && (
                    <span className="text-xs px-2.5 py-1 rounded-full status-busy ml-auto">Cerrado</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveHours}
              disabled={savingHours}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-dark font-semibold text-sm hover:bg-gold/90 transition-all disabled:opacity-50"
            >
              {savingHours ? (
                <><Loader2 size={15} className="animate-spin" /> Guardando...</>
              ) : hoursSaved ? (
                <>✓ Guardado</>
              ) : (
                <><Save size={15} /> Guardar Horarios</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Monthly Reports Section */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div
          className="px-6 py-4 border-b border-white/8 flex items-center justify-between cursor-pointer"
          onClick={() => setShowReports(!showReports)}
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gold" />
            <h3 className="font-semibold text-white">Reportes Mensuales</h3>
            {reports.length > 0 && (
              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-mono">
                {reports.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleGenerateManual(); }}
              disabled={generatingReport}
              className="text-xs px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              {generatingReport ? 'Generando...' : reportSuccess ? '✓ Guardado' : 'Generar reporte del mes'}
            </button>
            {showReports ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
          </div>
        </div>

        {showReports && (
          <div className="p-6">
            {reports.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">
                No hay reportes aún. Los reportes se generan automáticamente el día 1 de cada mes, o puedes generarlo manualmente.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="glass rounded-xl p-4 border border-white/8 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-semibold">
                        {getMonthName(report.month)} {report.year}
                      </h4>
                      <span className="text-xs text-zinc-500 font-mono">
                        #{String(report.month).padStart(2, '0')}/{report.year}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Ingresos</span>
                        <span className="text-gold font-mono font-bold text-sm">{formatCOP(report.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Reservas totales</span>
                        <span className="text-white font-mono text-sm">{report.totalBookings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Completadas</span>
                        <span className="text-green-400 font-mono text-sm">{report.completedBookings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Canceladas</span>
                        <span className="text-red-400 font-mono text-sm">{report.cancelledBookings}</span>
                      </div>
                      <div className="pt-2 border-t border-white/8">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400 text-xs">Barbero estrella</span>
                          <span className="text-amber-400 text-xs font-medium">{report.starBarberName}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-zinc-400 text-xs">Servicios</span>
                          <span className="text-zinc-300 font-mono text-xs">{report.starBarberServices}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}