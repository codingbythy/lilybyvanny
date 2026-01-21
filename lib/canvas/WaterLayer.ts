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
   * Update and render the water layer (watercolor style)
   */
  render(deltaTime: number) {
    this.time += deltaTime;

    // Watercolor style: Smooth gradients with soft transitions
    const skyHeight = this.height * 0.15;

    // Sky gradient (smooth watercolor)
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, skyHeight);
    skyGradient.addColorStop(0, this.colorScheme.skyTop);
    skyGradient.addColorStop(1, this.colorScheme.skyBottom);
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, skyHeight);

    // Water gradient (smooth watercolor)
    const waterGradient = this.ctx.createLinearGradient(0, skyHeight, 0, this.height);
    waterGradient.addColorStop(0, this.colorScheme.waterTop);
    waterGradient.addColorStop(1, this.colorScheme.waterBottom);
    this.ctx.fillStyle = waterGradient;
    this.ctx.fillRect(0, skyHeight, this.width, this.height - skyHeight);

    // Draw soft ambient waves
    this.drawWatercolorWaves();

    // Update and draw smooth ripples
    this.updateRipples();
  }

  /**
   * Draw soft watercolor waves
   */
  private drawWatercolorWaves() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    const skyHeight = this.height * 0.15;

    for (let i = 0; i < 4; i++) {
      const offset = (this.time * 0.0003 + i * 80) % this.height;

      this.ctx.beginPath();
      for (let x = 0; x <= this.width; x += 8) {
        const y = skyHeight + offset + Math.sin(x * 0.008 + this.time * 0.0008 + i) * 20;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      // Soft watercolor stroke
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Update and render smooth watercolor ripples
   */
  private updateRipples() {
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.alpha -= 0.01;

      if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
        return false;
      }

      // Draw smooth concentric ripples (watercolor style)
      this.ctx.save();
      this.ctx.globalAlpha = ripple.alpha;

      // Outer ripple
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();

      // Inner ripple (softer)
      if (ripple.radius > 15) {
        this.ctx.beginPath();
        this.ctx.arc(ripple.x, ripple.y, ripple.radius - 15, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      this.ctx.restore();

      return true;
    });
  }
}
