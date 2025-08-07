import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check GitHub environment variables
    const githubStatus = {
      token: !!process.env.GITHUB_TOKEN,
      owner: !!process.env.GITHUB_OWNER,
      repo: !!process.env.GITHUB_REPO,
    };

    // Check email environment variables
    let emailProvider = '';
    let emailConfigured = false;

    if (process.env.SENDGRID_API_KEY) {
      emailProvider = 'SendGrid';
      emailConfigured = true;
    } else if (process.env.MAILGUN_API_KEY) {
      emailProvider = 'Mailgun';
      emailConfigured = true;
    } else if (process.env.POSTMARK_API_KEY) {
      emailProvider = 'Postmark';
      emailConfigured = true;
    } else if (process.env.RESEND_API_KEY) {
      emailProvider = 'Resend';
      emailConfigured = true;
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      emailProvider = 'SMTP';
      emailConfigured = true;
    }

    const emailStatus = {
      configured: emailConfigured,
      provider: emailProvider,
    };

    return NextResponse.json({
      github: githubStatus,
      email: emailStatus,
    });

  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to check environment status' },
      { status: 500 }
    );
  }
}