import { supabase } from '../lib/supabase';
import type { Booking } from '../types';
import type { Barber } from '../types';

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  starBarberName: string;
  starBarberServices: number;
  createdAt: string;
}

interface MonthlyReportRow {
  id: string;
  year: number;
  month: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  star_barber_name: string;
  star_barber_services: number;
  created_at: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

function rowToReport(row: MonthlyReportRow): MonthlyReport {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    totalBookings: row.total_bookings,
    completedBookings: row.completed_bookings,
    cancelledBookings: row.cancelled_bookings,
    totalRevenue: row.total_revenue,
    starBarberName: row.star_barber_name,
    starBarberServices: row.star_barber_services,
    createdAt: row.created_at,
  };
}

export async function getMonthlyReports(): Promise<MonthlyReport[]> {
  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });
  if (error) throw error;
  return (data as MonthlyReportRow[]).map(rowToReport);
}

export async function generateMonthlyReport(
  year: number,
  month: number,
  bookings: Booking[],
  barbers: Barber[]
): Promise<MonthlyReport> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const monthBookings = bookings.filter((b) => b.date >= start && b.date <= end);
  const completed = monthBookings.filter((b) => b.status === 'completed');
  const cancelled = monthBookings.filter((b) => b.status === 'cancelled');
  const totalRevenue = completed.reduce((sum, b) => sum + b.price, 0);

  // Find star barber by counting completed bookings per barber
  const barberCounts: Record<string, { name: string; count: number }> = {};
  completed.forEach((b) => {
    if (!barberCounts[b.barberId]) {
      barberCounts[b.barberId] = { name: b.barberName, count: 0 };
    }
    barberCounts[b.barberId].count++;
  });

  let starBarberName = '—';
  let starBarberServices = 0;
  Object.values(barberCounts).forEach((b) => {
    if (b.count > starBarberServices) {
      starBarberName = b.name;
      starBarberServices = b.count;
    }
  });

  // If no completed bookings, fallback to barbers table
  if (starBarberName === '—' && barbers.length > 0) {
    const star = barbers.reduce((best, b) =>
      b.totalServicesMonth > best.totalServicesMonth ? b : best
    );
    starBarberName = star.name;
    starBarberServices = star.totalServicesMonth;
  }

  const { data, error } = await supabase
    .from('monthly_reports')
    .upsert({
      year,
      month,
      total_bookings: monthBookings.length,
      completed_bookings: completed.length,
      cancelled_bookings: cancelled.length,
      total_revenue: totalRevenue,
      star_barber_name: starBarberName,
      star_barber_services: starBarberServices,
    }, { onConflict: 'year,month' })
    .select()
    .single();

  if (error) throw error;
  return rowToReport(data as MonthlyReportRow);
}