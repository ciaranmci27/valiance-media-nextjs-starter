import LoginForm from './LoginForm';

export default function AdminLoginPage() {
  const showSetupHint =
    !process.env.ADMIN_PASSWORD_HASH &&
    process.env.DISABLE_ADMIN_AUTH !== 'true';

  return <LoginForm showSetupHint={showSetupHint} />;
}
