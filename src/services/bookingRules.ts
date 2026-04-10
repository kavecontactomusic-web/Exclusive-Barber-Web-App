import { supabase } from '../lib/supabase';

export interface BookingRules {
  slotDuration: number;
  minAdvanceHours: number;
  maxAheadDays: number;
}

export async function getBookingRules(): Promise<BookingRules> {
  const { data, error } = await supabase
    .from('booking_rules')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    // Valores por defecto si no hay datos
    return { slotDuration: 30, minAdvanceHours: 1, maxAheadDays: 14 };
  }

  return {
    slotDuration: data.slot_duration,
    minAdvanceHours: data.min_advance_hours,
    maxAheadDays: data.max_ahead_days,
  };
}

export async function updateBookingRules(rules: BookingRules): Promise<void> {
  const { error } = await supabase
    .from('booking_rules')
    .update({
      slot_duration: rules.slotDuration,
      min_advance_hours: rules.minAdvanceHours,
      max_ahead_days: rules.maxAheadDays,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) throw error;
}