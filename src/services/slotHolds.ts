import { supabase } from '../lib/supabase';

export interface SlotHold {
  id: string;
  barber_id: string;
  date: string;
  time: string;
  duration: number;
}

// Crear un hold temporal para un slot (dura 3 minutos)
export async function createSlotHold(
  barberId: string,
  date: string,
  time: string,
  duration: number
): Promise<string | null> {
  // Primero limpiar holds expirados
  await cleanExpiredHolds();

  const { data, error } = await supabase
    .from('slot_holds')
    .insert({
      barber_id: barberId,
      date,
      time,
      duration,
    })
    .select('id')
    .single();

  if (error) return null;
  return data.id;
}

// Eliminar un hold específico (cuando confirma o cancela)
export async function releaseSlotHold(holdId: string): Promise<void> {
  await supabase.from('slot_holds').delete().eq('id', holdId);
}

// Limpiar holds expirados
export async function cleanExpiredHolds(): Promise<void> {
  await supabase
    .from('slot_holds')
    .delete()
    .lt('expires_at', new Date().toISOString());
}

// Obtener holds activos para un barbero y fecha
export async function getActiveHoldsForBarberAndDate(
  barberId: string,
  date: string
): Promise<{ time: string; duration: number }[]> {
  await cleanExpiredHolds();

  const { data, error } = await supabase
    .from('slot_holds')
    .select('time, duration')
    .eq('barber_id', barberId)
    .eq('date', date)
    .gt('expires_at', new Date().toISOString());

  if (error) return [];
  return data as { time: string; duration: number }[];
}