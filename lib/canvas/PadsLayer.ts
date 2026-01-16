import { ColorScheme } from '../types';
import { SeededRandom } from '../random';

interface LilyPad {
  x: number;
  y: number;
  radius: number;
  angle: number;
  bobSpeed: number;
  bobOffset: number;
  wobble: number; // For interaction effect
  wobbleDecay: number;
  hasFlower: boolean; // Some pads have flowers
  flowerColor: string;
}

/**
 * Renders lily pads with gentle bobbing animation
 */
export class PadsLayer {
  private pads: LilyPad[] = [];
  private time: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private colorScheme: ColorScheme,
    count: number,
    seed: string
  ) {
    this.generatePads(count, seed);
  }

  /**
   * Generate lily pads at deterministic positions
   */
  private generatePads(count: number, seed: string) {
    const rng = new SeededRandom(seed);
    this.pads = [];

    // Water area starts at 15% of height (smaller sky)
    const waterTop = this.height * 0.15;
    const waterHeight = this.height * 0.85;

    // Softer, more natural watercolor flower colors like the bouquet
    const flowerColors = [
      '#FFB6C1', // Light pink
      '#F8BBD0', // Soft rose
      '#FADADD', // Pale pink
      '#E6B8D7', // Dusty lavender
      '#FFE0E9', // Blush
      '#FFF0F5', // Lavender blush
    ];

    for (let i = 0; i < count; i++) {
      const x = rng.nextFloat(0.1 * this.width, 0.9 * this.width);
      const y = waterTop + rng.nextFloat(0.1 * waterHeight, 0.9 * waterHeight);
      const radius = rng.nextFloat(25, 50);

      this.pads.push({
        x,
        y,
        radius,
        angle: rng.nextFloat(0, Math.PI * 2),
        bobSpeed: rng.nextFloat(0.001, 0.002),
        bobOffset: rng.nextFloat(0, Math.PI * 2),
        wobble: 0,
        wobbleDecay: 0.95,
        hasFlower: rng.next() > 0.4, // 60% chance of flower
        flowerColor: flowerColors[rng.nextInt(0, flowerColors.length - 1)],
      });
    }
  }

  /**
   * Update dimensions and regenerate pads
   */
  resize(width: number, height: number, count: number, seed: string) {
    this.width = width;
    this.height = height;
    this.generatePads(count, seed);
  }

  /**
   * Update color scheme
   */
  updateColorScheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme;
  }

  /**
   * Check if a point is on a lily pad and trigger wobble
   */
  handleClick(x: number, y: number): boolean {
    for (const pad of this.pads) {
      const dx = x - pad.x;
      const dy = y - (pad.y + Math.sin(this.time * pad.bobSpeed + pad.bobOffset) * 3);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pad.radius) {
        pad.wobble = 1.0; // Start wobble animation
        return true;
      }
    }
    return false;
  }

  /**
   * Get pad positions for other layers (e.g., frogs)
   */
  getPadPositions(): Array<{ x: number; y: number; radius: number }> {
    return this.pads.map(pad => ({
      x: pad.x,
      y: pad.y + Math.sin(this.time * pad.bobSpeed + pad.bobOffset) * 3,
      radius: pad.radius,
    }));
  }

  /**
   * Update and render lily pads
   */
  render(deltaTime: number) {
    this.time += deltaTime;

    for (const pad of this.pads) {
      // Update wobble
      if (pad.wobble > 0) {
        pad.wobble *= pad.wobbleDecay;
        if (pad.wobble < 0.01) pad.wobble = 0;
      }

      // Calculate bobbing position
      const bobY = Math.sin(this.time * pad.bobSpeed + pad.bobOffset) * 3;
      const wobbleOffset = Math.sin(this.time * 0.02) * pad.wobble * 10;

      const y = pad.y + bobY + wobbleOffset;

      // Draw pixelated shadow (8-bit style)
      this.ctx.save();
      const pixelSize = 4;
      const shadowRadius = pad.radius * 0.7;
      this.ctx.fillStyle = this.colorScheme.padShadow;

      // Simple oval shadow with pixels
      for (let sx = -shadowRadius; sx < shadowRadius; sx += pixelSize) {
        for (let sy = -shadowRadius * 0.4; sy < shadowRadius * 0.4; sy += pixelSize) {
          const dist = (sx * sx) / (shadowRadius * shadowRadius) + (sy * sy) / ((shadowRadius * 0.4) ** 2);
          if (dist < 1) {
            this.ctx.fillRect(pad.x + sx, y + 5 + sy, pixelSize, pixelSize);
          }
        }
      }
      this.ctx.restore();

      // Draw lily pad
      this.drawLilyPad(pad.x, y, pad.radius, pad.angle, pad.hasFlower, pad.flowerColor);
    }
  }

  /**
   * Draw a pixelated lily pad (8-bit style)
   */
  private drawLilyPad(x: number, y: number, radius: number, angle: number, hasFlower: boolean, flowerColor: string) {
    this.ctx.save();
    const pixelSize = 4;

    // Draw pixelated circle for lily pad
    const angles = 24; // Blocky circle
    const points: Array<{x: number, y: number}> = [];

    for (let i = 0; i < angles; i++) {
      const a = (Math.PI * 2 * i) / angles;
      const px = x + Math.cos(a) * radius;
      const py = y + Math.sin(a) * radius;

      // Snap to pixel grid
      points.push({
        x: Math.floor(px / pixelSize) * pixelSize,
        y: Math.floor(py / pixelSize) * pixelSize
      });
    }

    // Fill the pad with flat color
    this.ctx.fillStyle = this.colorScheme.padColor;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add dark outline (8-bit style)
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Add notch (V-cut) in pixelated style
    this.ctx.fillStyle = this.colorScheme.waterTop;
    this.ctx.beginPath();
    const notchX = x + Math.cos(angle + Math.PI / 10) * radius * 0.7;
    const notchY = y + Math.sin(angle + Math.PI / 10) * radius * 0.7;
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      Math.floor((x + Math.cos(angle) * radius) / pixelSize) * pixelSize,
      Math.floor((y + Math.sin(angle) * radius) / pixelSize) * pixelSize
    );
    this.ctx.lineTo(
      Math.floor(notchX / pixelSize) * pixelSize,
      Math.floor(notchY / pixelSize) * pixelSize
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.stroke();

    // Draw pixel flower if present
    if (hasFlower) {
      this.drawPixelFlower(x + radius * 0.2, y - radius * 0.1, radius * 0.35, flowerColor);
    }

    this.ctx.restore();
  }

  /**
   * Draw a pixelated flower (8-bit style)
   */
  private drawPixelFlower(x: number, y: number, size: number, color: string) {
    this.ctx.save();
    const pixelSize = 4;

    // Draw 4 simple petals in a cross pattern (8-bit style)
    const petalOffsets = [
      { dx: 0, dy: -1 },    // top
      { dx: 1, dy: 0 },     // right
      { dx: 0, dy: 1 },     // bottom
      { dx: -1, dy: 0 }     // left
    ];

    this.ctx.fillStyle = color;
    for (const offset of petalOffsets) {
      const petalX = Math.floor((x + offset.dx * size * 0.6) / pixelSize) * pixelSize;
      const petalY = Math.floor((y + offset.dy * size * 0.6) / pixelSize) * pixelSize;

      // Draw blocky petal (3x2 pixel blocks)
      this.ctx.fillRect(petalX - pixelSize, petalY - pixelSize, pixelSize * 2, pixelSize * 2);
    }

    // Draw center as yellow square
    const centerX = Math.floor(x / pixelSize) * pixelSize;
    const centerY = Math.floor(y / pixelSize) * pixelSize;

    this.ctx.fillStyle = '#FFD700'; // Gold center
    this.ctx.fillRect(centerX - pixelSize, centerY - pixelSize, pixelSize * 2, pixelSize * 2);

    // Add black outline to center
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(centerX - pixelSize, centerY - pixelSize, pixelSize * 2, pixelSize * 2);

    this.ctx.restore();
  }

  /**
   * Lighten a hex color for watercolor effect
   */
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
