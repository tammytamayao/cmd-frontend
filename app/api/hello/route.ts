import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Hello from the API! 2',
    timestamp: new Date().toISOString(),
  });
}
