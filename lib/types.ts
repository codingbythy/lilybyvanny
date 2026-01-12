// Pond configuration type
export interface PondConfig {
  pads: number;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  koi: boolean;
  frogs: boolean;
  dedication: string;
  seed: string;
}

// Time of day color schemes
export interface ColorScheme {
  skyTop: string;
  skyBottom: string;
  waterTop: string;
  waterBottom: string;
  padColor: string;
  padShadow: string;
  textColor: string;
}
