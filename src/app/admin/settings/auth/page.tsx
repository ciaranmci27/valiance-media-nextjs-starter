import AuthSettings from './AuthSettings';
import { getAuthProvider } from '@/lib/admin/auth-provider';

export default function AuthSettingsPage() {
  const authProvider = getAuthProvider();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS ?? '';

  return (
    <AuthSettings
      authProvider={authProvider}
      supabaseUrl={supabaseUrl}
      allowedEmails={allowedEmails}
    />
  );
}
