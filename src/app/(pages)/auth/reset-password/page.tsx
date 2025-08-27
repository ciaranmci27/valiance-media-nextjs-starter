// NOTE: This page uses 'use client' so it CANNOT have metadata export
// Client components don't support static metadata exports
// SEO for this page uses default app metadata
'use client';

export default function ResetPasswordPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Reset Password</h1>
      <p>Enter your email to reset your password.</p>
    </div>
  );
}