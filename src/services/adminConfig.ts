import { supabase } from '../lib/supabase';

export async function getAdminPassword(): Promise<string> {
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'admin_password')
    .single();
  if (error) return 'Admin2026'; // fallback
  return data.value;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const { error } = await supabase
    .from('admin_config')
    .update({ value: newPassword, updated_at: new Date().toISOString() })
    .eq('key', 'admin_password');
  if (error) throw error;
}