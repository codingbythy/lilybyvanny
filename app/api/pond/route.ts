import { NextRequest, NextResponse } from 'next/server';
import { PondConfig } from '@/lib/types';
import { generatePondId, encodePondConfig } from '@/lib/encoding';

// In-memory storage for development (would use Vercel KV or Postgres in production)
// This will reset when the server restarts, but works for demo purposes
const pondStorage = new Map<string, PondConfig>();

export async function POST(request: NextRequest) {
  try {
    const config: PondConfig = await request.json();

    // Validate config
    if (
      typeof config.pads !== 'number' ||
      config.pads < 1 ||
      config.pads > 30 ||
      !['dawn', 'day', 'dusk', 'night'].includes(config.timeOfDay) ||
      typeof config.koi !== 'boolean' ||
      typeof config.frogs !== 'boolean' ||
      typeof config.dedication !== 'string' ||
      config.dedication.length > 80 ||
      typeof config.seed !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid pond configuration' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = generatePondId();

    // Store configuration
    pondStorage.set(id, config);

    // Also provide URL-encoded fallback
    const encoded = encodePondConfig(config);

    return NextResponse.json({
      id,
      url: `/pond/${id}`,
      fallbackUrl: `/pond/encoded?data=${encoded}`,
    });
  } catch (error) {
    console.error('Error creating pond:', error);
    return NextResponse.json(
      { error: 'Failed to create pond' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing pond ID' },
      { status: 400 }
    );
  }

  const config = pondStorage.get(id);

  if (!config) {
    return NextResponse.json(
      { error: 'Pond not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(config);
}
