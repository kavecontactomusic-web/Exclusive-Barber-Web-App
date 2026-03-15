import { supabase } from '../lib/supabase';

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

const DEFAULT_HOURS: BusinessHour[] = [
  { day: 'Lunes', open: '09:00', close: '19:00', closed: false },
  { day: 'Martes', open: '09:00', close: '19:00', closed: false },
  { day: 'Miércoles', open: '09:00', close: '19:00', closed: false },
  { day: 'Jueves', open: '09:00', close: '19:00', closed: false },
  { day: 'Viernes', open: '09:00', close: '19:00', closed: false },
  { day: 'Sábado', open: '09:00', close: '18:00', closed: false },
  { day: 'Domingo', open: '', close: '', closed: true },
];

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'business_hours')
    .single();

  if (error || !data) return DEFAULT_HOURS;

  try {
    return JSON.parse(data.value) as BusinessHour[];
  } catch {
    return DEFAULT_HOURS;
  }
}

export async function updateBusinessHours(hours: BusinessHour[]): Promise<void> {
  await supabase
    .from('admin_config')
    .update({ value: JSON.stringify(hours), updated_at: new Date().toISOString() })
    .eq('key', 'business_hours');
}