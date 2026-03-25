import { supabase } from '../lib/supabase';

export interface DaySchedule {
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
}

export async function getSchedule(): Promise<DaySchedule[]> {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .order('day_of_week', { ascending: true });
  if (error) throw error;
  return data as DaySchedule[];
}

export async function updateDaySchedule(day: DaySchedule): Promise<void> {
  const { error } = await supabase
    .from('schedule')
    .update({
      is_open: day.is_open,
      open_time: day.open_time,
      close_time: day.close_time,
      lunch_start: day.lunch_start || null,
      lunch_end: day.lunch_end || null,
    })
    .eq('day_of_week', day.day_of_week);
  if (error) throw error;
}