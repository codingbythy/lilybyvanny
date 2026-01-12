import { ColorScheme } from '../types';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

/**
 * Renders water background with animated ripples
 */
export class WaterLayer {
  private ripples: Ripple[] = [];
  private time: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private colorScheme: ColorScheme
  ) {}

  /**
   * Update dimensions when canvas is resized
   */
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Update color scheme (e.g., when time of day changes)
   */
  updateColorScheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme;
  }

  /**
   * Add a ripple at the given position
   */
  addRipple(x: number, y: number, maxRadius: number = 100) {
    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius,
      alpha: 0.6,
      speed: 2,
    });
  }

  /**
   * Update and render the water layer
   */
  render(deltaTime: number) {
    this.time += deltaTime;

    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.colorScheme.skyTop);
    gradient.addColorStop(0.4, this.colorScheme.skyBottom);
    gradient.addColorStop(0.4, this.colorScheme.waterTop);
    gradient.addColorStop(1, this.colorScheme.waterBottom);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ambient ripples (subtle wave effect)
    this.drawAmbientWaves();

    // Update and draw interactive ripples
    this.updateRipples();
  }

  /**
   * Draw subtle ambient waves across the water surface
   */
  private drawAmbientWaves() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;

    for (let i = 0; i < 3; i++) {
      const offset = (this.time * 0.0003 + i * 100) % this.height;

      this.ctx.beginPath();
      for (let x = 0; x <= this.width; x += 10) {
        const y = this.height * 0.4 + offset +
                  Math.sin(x * 0.01 + this.time * 0.001 + i) * 15;
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Update and render interactive ripples
   */
  private updateRipples() {
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.alpha -= 0.01;

      if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
        return false;
      }

      // Draw ripple
      this.ctx.save();
      this.ctx.globalAlpha = ripple.alpha;
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();

      return true;
    });
  }
}
