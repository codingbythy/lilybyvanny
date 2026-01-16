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
   * Update and render the water layer (8-bit style)
   */
  render(deltaTime: number) {
    this.time += deltaTime;

    // 8-bit style: Flat colors with dithered transition
    const skyHeight = this.height * 0.15;

    // Sky - flat color
    this.ctx.fillStyle = this.colorScheme.skyTop;
    this.ctx.fillRect(0, 0, this.width, skyHeight);

    // Dithered transition between sky and water (8-bit effect)
    this.drawDitheredTransition(skyHeight - 8, 16);

    // Water - flat color
    this.ctx.fillStyle = this.colorScheme.waterTop;
    this.ctx.fillRect(0, skyHeight, this.width, this.height - skyHeight);

    // Draw pixelated ambient waves
    this.drawPixelatedWaves();

    // Update and draw pixelated ripples
    this.updateRipples();
  }

  /**
   * Draw dithered transition for 8-bit effect
   */
  private drawDitheredTransition(startY: number, height: number) {
    const pixelSize = 4; // 8-bit pixel size

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < this.width; x += pixelSize) {
        // Dither pattern based on position
        const density = y / height; // 0 to 1
        const ditherPattern = (x / pixelSize + y / pixelSize) % 2;

        if (Math.random() > density - ditherPattern * 0.5) {
          this.ctx.fillStyle = this.colorScheme.skyBottom;
        } else {
          this.ctx.fillStyle = this.colorScheme.waterTop;
        }

        this.ctx.fillRect(x, startY + y, pixelSize, pixelSize);
      }
    }
  }

  /**
   * Draw pixelated ambient waves (8-bit style)
   */
  private drawPixelatedWaves() {
    this.ctx.save();
    const pixelSize = 4;
    const skyHeight = this.height * 0.15;

    for (let i = 0; i < 3; i++) {
      const offset = (this.time * 0.0005 + i * 50) % this.height;

      for (let x = 0; x < this.width; x += pixelSize * 2) {
        const waveY = skyHeight + offset + Math.sin(x * 0.02 + this.time * 0.001 + i) * 15;

        // Draw blocky wave pixels
        if (waveY > skyHeight && waveY < this.height) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          this.ctx.fillRect(x, Math.floor(waveY / pixelSize) * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    this.ctx.restore();
  }

  /**
   * Update and render pixelated ripples (8-bit style)
   */
  private updateRipples() {
    const pixelSize = 4;

    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.alpha -= 0.01;

      if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
        return false;
      }

      // Draw pixelated concentric square ripple (8-bit style)
      this.ctx.save();
      this.ctx.globalAlpha = ripple.alpha;

      // Draw blocky circle using pixels
      const angles = 32; // Number of points for blocky circle
      for (let i = 0; i < angles; i++) {
        const angle = (Math.PI * 2 * i) / angles;
        const px = ripple.x + Math.cos(angle) * ripple.radius;
        const py = ripple.y + Math.sin(angle) * ripple.radius;

        // Snap to pixel grid
        const gridX = Math.floor(px / pixelSize) * pixelSize;
        const gridY = Math.floor(py / pixelSize) * pixelSize;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(gridX, gridY, pixelSize, pixelSize);
      }

      this.ctx.restore();

      return true;
    });
  }
}
