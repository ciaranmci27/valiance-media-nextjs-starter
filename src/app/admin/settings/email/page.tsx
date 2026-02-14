import EmailSettings from './EmailSettings';

export default function EmailSettingsPage() {
  const encryptionConfigured = !!process.env.SMTP_ENCRYPTION_KEY;
  return <EmailSettings encryptionConfigured={encryptionConfigured} />;
}
