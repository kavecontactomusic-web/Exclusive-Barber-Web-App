import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, DollarSign, CheckCircle, XCircle, Users } from 'lucide-react';
import { getBookingsByMonth, getBookingsByYear } from '../../services/bookings';
import { getBarbers } from '../../services/barbers';
import { formatCOP } from '../../data';
import type { Booking, Barber } from '../../types';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const heatmapData = [
  [20, 40, 60, 80, 70, 50, 30],
  [30, 60, 90, 100, 85, 65, 40],
  [25, 55, 85, 95, 80, 60, 35],
  [35, 65, 85, 90, 75, 55, 30],
  [15, 35, 55, 65, 50, 35, 20],
  [10, 20, 30, 40, 30, 20, 10],
  [5, 10, 15, 20, 15, 10, 5],
  [0, 5, 10, 15, 10, 5, 0],
  [5, 10, 5, 10, 5, 5, 0],
];

const daysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const hourLabels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];

function TrendBadge({ current, prev }: { current: number; prev: number }) {
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return (
    <span className="flex items-center gap-0.5 text-[10px] text-green-400"><TrendingUp size={10} /> Nuevo</span>
  );
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return <span className="flex items-center gap-0.5 text-[10px] text-zinc-500"><Minus size={10} /> 0%</span>;
  if (pct > 0) return <span className="flex items-center gap-0.5 text-[10px] text-green-400"><TrendingUp size={10} /> +{pct}%</span>;
  return <span className="flex items-center gap-0.5 text-[10px] text-red-400"><TrendingDown size={10} /> {pct}%</span>;
}

export default function AdminReports() {
  const now = new Date();
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prevBookings, setPrevBookings] = useState<Booking[]>([]);
  const [yearBookings, setYearBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (viewMode === 'month') {
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      Promise.all([
        getBookingsByMonth(selectedYear, selectedMonth),
        getBookingsByMonth(prevYear, prevMonth),
        getBarbers(),
      ]).then(([curr, prev, b]) => {
        setBookings(curr);
        setPrevBookings(prev);
        setBarbers(b);
      }).finally(() => setLoading(false));
    } else {
      Promise.all([
        getBookingsByYear(selectedYear),
        getBarbers(),
      ]).then(([yr, b]) => {
        setYearBookings(yr);
        setBarbers(b);
      }).finally(() => setLoading(false));
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const navMonth = (dir: number) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const data = viewMode === 'month' ? bookings : yearBookings;
  const completed = data.filter((b) => b.status === 'completed');
  const revenue = completed.reduce((s, b) => s + b.price, 0);
  const cancelled = data.filter((b) => b.status === 'cancelled').length;
  const avgTicket = completed.length > 0 ? Math.round(revenue / completed.length) : 0;

  const prevCompleted = prevBookings.filter((b) => b.status === 'completed');
  const prevRevenue = prevCompleted.reduce((s, b) => s + b.price, 0);
  const prevCancelled = prevBookings.filter((b) => b.status === 'cancelled').length;
  const prevAvgTicket = prevCompleted.length > 0 ? Math.round(prevRevenue / prevCompleted.length) : 0;

  const barberRevenue = barbers.map((b) => ({
    name: b.shortName,
    revenue: completed.filter((bk) => bk.barberId === b.id).reduce((s, bk) => s + bk.price, 0),
  })).sort((a, b) => b.revenue - a.revenue);
  const maxBarberRevenue = Math.max(...barberRevenue.map((b) => b.revenue), 1);

  const serviceMap = new Map<string, number>();
  completed.forEach((b) => serviceMap.set(b.serviceName, (serviceMap.get(b.serviceName) || 0) + b.price));
  const serviceRevenue = Array.from(serviceMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxServiceRevenue = Math.max(...serviceRevenue.map((s) => s.revenue), 1);

  const monthlyData = MONTHS_ES.map((name, i) => {
    const month = i + 1;
    const mBookings = yearBookings.filter((b) => {
      const m = parseInt(b.date.slice(5, 7));
      return m === month;
    });
    const mCompleted = mBookings.filter((b) => b.status === 'completed');
    return {
      name,
      shortName: name.slice(0, 3),
      bookings: mBookings.length,
      revenue: mCompleted.reduce((s, b) => s + b.price, 0),
      completed: mCompleted.length,
    };
  });
  const maxMonthRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  const kpis = viewMode === 'month' ? [
    { label: 'Ingresos', value: formatCOP(revenue), sub: `${completed.length} servicios`, icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10 border-gold/20', trend: <TrendBadge current={revenue} prev={prevRevenue} /> },
    { label: 'Completadas', value: String(completed.length), sub: 'reservas completadas', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', trend: <TrendBadge current={completed.length} prev={prevCompleted.length} /> },
    { label: 'Ticket Promedio', value: formatCOP(avgTicket), sub: 'por servicio', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', trend: <TrendBadge current={avgTicket} prev={prevAvgTicket} /> },
    { label: 'Cancelaciones', value: String(cancelled), sub: 'en este período', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', trend: <TrendBadge current={cancelled} prev={prevCancelled} /> },
  ] : [
    { label: 'Ingresos Anuales', value: formatCOP(revenue), sub: `${completed.length} servicios`, icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10 border-gold/20', trend: null },
    { label: 'Completadas', value: String(completed.length), sub: 'en el año', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', trend: null },
    { label: 'Total Clientes', value: String(new Set(data.map((b) => b.clientPhone)).size), sub: 'clientes únicos', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', trend: null },
    { label: 'Cancelaciones', value: String(cancelled), sub: 'en el año', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', trend: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 glass rounded-xl p-1 border border-white/8">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-gold/20 text-gold' : 'text-zinc-500 hover:text-white'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'year' ? 'bg-gold/20 text-gold' : 'text-zinc-500 hover:text-white'}`}
            >
              Anual
            </button>
          </div>

          {viewMode === 'month' ? (
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 border border-white/8">
              <button onClick={() => navMonth(-1)} className="text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white text-sm font-medium min-w-[120px] text-center">
                {MONTHS_ES[selectedMonth - 1]} {selectedYear}
              </span>
              <button
                onClick={() => navMonth(1)}
                disabled={selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1}
                className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 border border-white/8">
              <button onClick={() => setSelectedYear((y) => y - 1)} className="text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">{selectedYear}</span>
              <button
                onClick={() => setSelectedYear((y) => y + 1)}
                disabled={selectedYear >= now.getFullYear()}
                className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-colors">
          <Download size={14} />
          Exportar PDF
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-600 text-sm">Cargando datos...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className={`glass rounded-2xl p-5 border ${kpi.bg}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg.split(' ')[0]}`}>
                      <Icon size={18} className={kpi.color} />
                    </div>
                    {kpi.trend}
                  </div>
                  <p className={`font-mono text-xl font-bold mb-0.5 ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-white text-xs font-medium">{kpi.label}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {viewMode === 'year' && (
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-semibold text-white mb-5">Ingresos por Mes — {selectedYear}</h3>
              <div className="flex items-end gap-2 h-36 mb-3">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => { setViewMode('month'); setSelectedMonth(i + 1); }}>
                    <div
                      className="w-full rounded-t-sm transition-all group-hover:opacity-90"
                      style={{
                        height: m.revenue > 0 ? `${Math.max((m.revenue / maxMonthRevenue) * 100, 8)}%` : '8%',
                        background: m.revenue > 0
                          ? 'linear-gradient(to top, #D4AF37, #F5E8A1)'
                          : 'rgba(255,255,255,0.05)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-zinc-600 text-[9px]">{m.shortName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-semibold text-white mb-5">Ingresos por Barbero</h3>
              <div className="space-y-4">
                {barberRevenue.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-4">Sin datos aún</p>
                ) : barberRevenue.map((b) => (
                  <div key={b.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-zinc-300 text-sm">{b.name}</span>
                      <span className="font-mono text-gold text-sm font-semibold">{formatCOP(b.revenue)}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300 transition-all duration-700"
                        style={{ width: `${(b.revenue / maxBarberRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-semibold text-white mb-5">Ingresos por Servicio</h3>
              <div className="space-y-4">
                {serviceRevenue.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-4">Sin datos aún</p>
                ) : serviceRevenue.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-zinc-300 text-sm">{s.name}</span>
                      <span className="font-mono text-gold text-sm font-semibold">{formatCOP(s.revenue)}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                        style={{ width: `${(s.revenue / maxServiceRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/8">
            <h3 className="font-semibold text-white mb-5">Horas Pico de la Semana</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <div className="flex flex-col gap-2 justify-start pt-0">
                  {hourLabels.map((h) => (
                    <div key={h} className="text-zinc-600 text-xs w-10 text-right leading-none" style={{ height: '28px', lineHeight: '28px' }}>
                      {h}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-2 mb-2 pl-0">
                    {daysLabels.map((d) => (
                      <div key={d} className="text-zinc-600 text-xs text-center" style={{ width: '40px' }}>{d}</div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {daysLabels.map((_, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-2">
                        {heatmapData.map((row, rowIdx) => {
                          const val = row[colIdx];
                          const opacity = val / 100;
                          return (
                            <div
                              key={rowIdx}
                              className="rounded-md"
                              style={{
                                width: '40px',
                                height: '28px',
                                background: `rgba(212, 175, 55, ${opacity * 0.7 + 0.05})`,
                              }}
                              title={`${hourLabels[rowIdx]} ${daysLabels[colIdx]}: ${val}%`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-zinc-600 text-xs">Menos ocupado</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                  <div key={v} className="w-5 h-3 rounded-sm" style={{ background: `rgba(212,175,55,${v})` }} />
                ))}
              </div>
              <span className="text-zinc-600 text-xs">Más ocupado</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
