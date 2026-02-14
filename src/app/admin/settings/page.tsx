import SettingsHub from './SettingsHub';
import { getAuthProvider, isSupabaseConfigured } from '@/lib/admin/auth-provider';

export default function SettingsPage() {
  const authProvider = getAuthProvider();
  const supabaseConfigured = isSupabaseConfigured();
  const smtpConfigured = !!process.env.SMTP_ENCRYPTION_KEY;
  return <SettingsHub authProvider={authProvider} supabaseConfigured={supabaseConfigured} smtpConfigured={smtpConfigured} />;
}
