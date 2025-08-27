// NOTE: This page uses 'use client' so it CANNOT have metadata export
// Client components don't support static metadata exports
// SEO for this page uses default app metadata
'use client';

export default function ConfirmEmailPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Confirm Email</h1>
      <p>Please check your email to confirm your account.</p>
    </div>
  );
}