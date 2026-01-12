import { ColorScheme } from './types';

/**
 * Get color scheme based on time of day
 */
export function getColorScheme(timeOfDay: string): ColorScheme {
  switch (timeOfDay) {
    case 'dawn':
      return {
        skyTop: '#FFA07A',
        skyBottom: '#FFE4B5',
        waterTop: 'rgba(135, 180, 200, 0.7)',
        waterBottom: 'rgba(70, 130, 180, 0.9)',
        padColor: '#2D5016',
        padShadow: 'rgba(0, 0, 0, 0.3)',
        textColor: '#4A4A4A',
      };
    case 'day':
      return {
        skyTop: '#87CEEB',
        skyBottom: '#E0F6FF',
        waterTop: 'rgba(100, 180, 220, 0.7)',
        waterBottom: 'rgba(50, 120, 180, 0.9)',
        padColor: '#3A6B35',
        padShadow: 'rgba(0, 0, 0, 0.2)',
        textColor: '#2C3E50',
      };
    case 'dusk':
      return {
        skyTop: '#FF6B6B',
        skyBottom: '#FFA500',
        waterTop: 'rgba(100, 100, 150, 0.7)',
        waterBottom: 'rgba(60, 60, 120, 0.9)',
        padColor: '#2B4B2B',
        padShadow: 'rgba(0, 0, 0, 0.4)',
        textColor: '#5A5A5A',
      };
    case 'night':
      return {
        skyTop: '#191970',
        skyBottom: '#000033',
        waterTop: 'rgba(20, 30, 60, 0.8)',
        waterBottom: 'rgba(10, 15, 40, 0.95)',
        padColor: '#1A2F1A',
        padShadow: 'rgba(0, 0, 0, 0.6)',
        textColor: '#B0B0B0',
      };
    default:
      return getColorScheme('day');
  }
}
