import { supabase } from '../lib/supabase';
import type { Barber } from '../types';

interface BarberRow {
  id: string;
  name: string;
  short_name: string;
  phone: string;
  bio: string;
  specialties: string[];
  rating: number;
  review_count: number;
  available: boolean;
  pin: string;
  commission: number;
  total_services_month: number;
  earnings_month: number;
  avatar: string;
}

function rowToBarber(row: BarberRow): Barber {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    phone: row.phone,
    bio: row.bio,
    specialties: row.specialties,
    rating: row.rating,
    reviewCount: row.review_count,
    available: row.available,
    pin: row.pin,
    commission: row.commission,
    totalServicesMonth: row.total_services_month,
    earningsMonth: row.earnings_month,
    avatar: row.avatar,
  };
}

export async function getBarbers(): Promise<Barber[]> {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data as BarberRow[]).map(rowToBarber);
}

export async function updateBarberAvailability(id: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from('barbers')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function createBarber(barber: Omit<Barber, 'id' | 'reviewCount' | 'totalServicesMonth' | 'earningsMonth'>): Promise<Barber> {
  const { data, error } = await supabase
    .from('barbers')
    .insert({
      name: barber.name,
      short_name: barber.shortName,
      phone: barber.phone,
      bio: barber.bio,
      specialties: barber.specialties,
      rating: barber.rating,
      review_count: 0,
      available: barber.available,
      pin: barber.pin,
      commission: barber.commission,
      total_services_month: 0,
      earnings_month: 0,
      avatar: barber.avatar,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBarber(data as BarberRow);
}

export async function updateBarber(id: string, updates: Partial<Barber>): Promise<void> {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.shortName !== undefined) dbUpdates.short_name = updates.shortName;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.specialties !== undefined) dbUpdates.specialties = updates.specialties;
  if (updates.available !== undefined) dbUpdates.available = updates.available;
  if (updates.pin !== undefined) dbUpdates.pin = updates.pin;
  if (updates.commission !== undefined) dbUpdates.commission = updates.commission;

  const { error } = await supabase
    .from('barbers')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteBarber(id: string): Promise<void> {
  const { error } = await supabase
    .from('barbers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
