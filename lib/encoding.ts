import { PondConfig } from './types';

/**
 * Encode pond config to base64 URL-safe string
 * Used as fallback when database is not available
 */
export function encodePondConfig(config: PondConfig): string {
  // Create compact representation
  const compact = {
    p: config.pads,
    t: config.timeOfDay[0], // 'd', 'D', 'u', 'n' for dawn/day/dusk/night
    k: config.koi ? 1 : 0,
    f: config.frogs ? 1 : 0,
    d: config.dedication.substring(0, 80), // Limit dedication length
    s: config.seed,
  };

  const jsonStr = JSON.stringify(compact);
  const base64 = Buffer.from(jsonStr).toString('base64');
  // Make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode pond config from base64 string
 */
export function decodePondConfig(encoded: string): PondConfig | null {
  try {
    // Restore base64 padding
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonStr = Buffer.from(base64 + padding, 'base64').toString();
    const compact = JSON.parse(jsonStr);

    // Expand time of day
    const timeOfDayMap: { [key: string]: 'dawn' | 'day' | 'dusk' | 'night' } = {
      d: 'dawn',
      D: 'day',
      u: 'dusk',
      n: 'night',
    };

    return {
      pads: compact.p,
      timeOfDay: timeOfDayMap[compact.t] || 'day',
      koi: compact.k === 1,
      frogs: compact.f === 1,
      dedication: compact.d || '',
      seed: compact.s,
    };
  } catch (error) {
    console.error('Failed to decode pond config:', error);
    return null;
  }
}

/**
 * Generate a random short ID for pond configs
 */
export function generatePondId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
