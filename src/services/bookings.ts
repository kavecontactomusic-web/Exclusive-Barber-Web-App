import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

interface BookingRow {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: string;
  service_name: string;
  barber_id: string;
  barber_name: string;
  date: string;
  time: string;
  price: number;
  duration: number;
  status: string;
  created_at: string;
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceId: row.service_id,
    serviceName: row.service_name,
    barberId: row.barber_id,
    barberName: row.barber_name,
    date: row.date,
    time: row.time,
    price: row.price,
    duration: row.duration ?? 30,
    status: row.status as Booking['status'],
    createdAt: row.created_at,
  };
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: true });
  if (error) throw error;
  return (data as BookingRow[]).map(rowToBooking);
}

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true });
  if (error) throw error;
  return (data as BookingRow[]).map(rowToBooking);
}

export async function getBookingsByBarberAndDate(barberId: string, date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('barber_id', barberId)
    .eq('date', date)
    .order('time', { ascending: true });
  if (error) throw error;
  return (data as BookingRow[]).map(rowToBooking);
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_name: booking.clientName,
      client_phone: booking.clientPhone,
      client_email: booking.clientEmail ?? '',
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      barber_id: booking.barberId,
      barber_name: booking.barberName,
      date: booking.date,
      time: booking.time,
      price: booking.price,
      duration: booking.duration ?? 30,
      status: booking.status,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBooking(data as BookingRow);
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getBookingsByMonth(year: number, month: number): Promise<Booking[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  if (error) throw error;
  return (data as BookingRow[]).map(rowToBooking);
}

export async function getBookingsByYear(year: number): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data as BookingRow[]).map(rowToBooking);
}

export async function getOccupiedSlotsForBarberAndDate(
  barberId: string,
  date: string
): Promise<{ time: string; duration: number }[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('time, duration')
    .eq('barber_id', barberId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);
  if (error) throw error;
  return (data as { time: string; duration: number }[]).map((row) => ({
    time: row.time,
    duration: row.duration ?? 30,
  }));
}