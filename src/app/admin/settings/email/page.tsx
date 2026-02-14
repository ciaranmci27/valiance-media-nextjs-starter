import EmailSettings from './EmailSettings';

export default function EmailSettingsPage() {
  const encryptionConfigured = !!process.env.SMTP_ENCRYPTION_KEY;
  const isProduction = process.env.NODE_ENV === 'production';
  return <EmailSettings encryptionConfigured={encryptionConfigured} isProduction={isProduction} />;
}
