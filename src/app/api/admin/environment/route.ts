import { NextResponse } from 'next/server';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isProduction,
    canEditPages: !isProduction
  });
}