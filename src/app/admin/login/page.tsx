import LoginForm from '@/components/admin/login/LoginForm';
import { getAuthProvider } from '@/lib/admin/auth-provider';

export default function AdminLoginPage() {
  const authProvider = getAuthProvider();
  const showSetupHint =
    authProvider === 'simple' &&
    !process.env.SIMPLE_ADMIN_PASSWORD_HASH &&
    process.env.DISABLE_ADMIN_AUTH !== 'true';

  return <LoginForm showSetupHint={showSetupHint} authProvider={authProvider} />;
}
