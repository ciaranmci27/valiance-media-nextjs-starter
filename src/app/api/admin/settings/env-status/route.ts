import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check GitHub environment variables
    const githubStatus = {
      token: !!process.env.GITHUB_TOKEN,
      owner: !!process.env.GITHUB_OWNER,
      repo: !!process.env.GITHUB_REPO,
    };

    return NextResponse.json({
      github: githubStatus,
    });

  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to check environment status' },
      { status: 500 }
    );
  }
}