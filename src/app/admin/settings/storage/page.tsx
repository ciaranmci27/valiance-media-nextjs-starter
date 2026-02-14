import StorageSettings from './StorageSettings';
import { isSupabaseConfigured } from '@/lib/admin/auth-provider';

export default function StorageSettingsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  return (
    <StorageSettings
      supabaseConfigured={supabaseConfigured}
      supabaseUrl={supabaseUrl}
    />
  );
}
