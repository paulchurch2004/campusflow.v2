import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple endpoint for polling updates
    // Returns a simple response indicating there are updates available
    return NextResponse.json({
      hasUpdates: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error checking updates:', error);
    return NextResponse.json(
      { error: 'Failed to check updates' },
      { status: 500 }
    );
  }
}
