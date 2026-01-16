import { PondConfig } from '../types';
import { getColorScheme } from '../colors';
import { WaterLayer } from './WaterLayer';
import { PadsLayer } from './PadsLayer';
import { KoiLayer } from './KoiLayer';
import { FrogLayer } from './FrogLayer';
import { TextLayer } from './TextLayer';

/**
 * Main pond renderer that orchestrates all layers
 */
export class PondRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private waterLayer: WaterLayer;
  private padsLayer: PadsLayer;
  private koiLayer: KoiLayer;
  private frogLayer: FrogLayer;
  private textLayer: TextLayer;
  private lastFrameTime: number = 0;
  private animationId: number | null = null;
  private config: PondConfig;

  constructor(canvas: HTMLCanvasElement, config: PondConfig) {
    this.canvas = canvas;
    this.config = config;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;

    // Set up canvas with device pixel ratio for retina displays
    this.setupCanvas();

    const colorScheme = getColorScheme(config.timeOfDay);
    const { width, height } = this.getDisplayDimensions();

    // Initialize layers
    this.waterLayer = new WaterLayer(this.ctx, width, height, colorScheme);
    this.padsLayer = new PadsLayer(this.ctx, width, height, colorScheme, config.pads, config.seed);
    this.koiLayer = new KoiLayer(this.ctx, width, height, config.koi, config.seed);
    this.frogLayer = new FrogLayer(this.ctx, config.frogs, config.pads, config.seed);
    this.textLayer = new TextLayer(this.ctx, width, height, colorScheme, config.dedication);

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Set up canvas with proper scaling for retina displays
   */
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    // Set canvas display size
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  /**
   * Get display dimensions (not DPR-scaled)
   */
  private getDisplayDimensions(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  /**
   * Handle canvas resize
   */
  private handleResize() {
    this.setupCanvas();
    const { width, height } = this.getDisplayDimensions();
    const colorScheme = getColorScheme(this.config.timeOfDay);

    this.waterLayer.resize(width, height);
    this.padsLayer.resize(width, height, this.config.pads, this.config.seed);
    this.koiLayer.resize(width, height, this.config.koi, this.config.seed);
    this.frogLayer.resize(this.config.frogs, this.config.pads, this.config.seed);
    this.textLayer.resize(width, height);
  }

  /**
   * Start animation loop
   */
  start() {
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Stop animation loop
   */
  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('resize', () => this.handleResize());
  }

  /**
   * Main animation loop
   */
  private animate = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Clear canvas (use display dimensions, not physical canvas size)
    const { width, height } = this.getDisplayDimensions();
    this.ctx.clearRect(0, 0, width, height);

    // Render layers in order
    this.waterLayer.render(deltaTime);
    this.koiLayer.render(deltaTime);

    const padPositions = this.padsLayer.getPadPositions();
    this.padsLayer.render(deltaTime);

    this.frogLayer.render(deltaTime, padPositions);
    this.textLayer.render();

    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Handle click/tap interaction
   */
  handleClick(x: number, y: number) {
    // x and y are already in the correct coordinate space (CSS pixels)
    // since we use display dimensions and the context is scaled by DPR

    // Make koi fish flee from click position
    this.koiLayer.handleClick(x, y);

    // Check if clicked on a lily pad
    const hitPad = this.padsLayer.handleClick(x, y);

    // Add ripple at click position
    this.waterLayer.addRipple(x, y, hitPad ? 60 : 100);
  }
}
