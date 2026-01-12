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

    // Water area starts at 40% of height
    const waterTop = this.height * 0.4;
    const waterHeight = this.height * 0.6;

    for (let i = 0; i < count; i++) {
      const x = rng.nextFloat(0.1 * this.width, 0.9 * this.width);
      const y = waterTop + rng.nextFloat(0.1 * waterHeight, 0.9 * waterHeight);
      const radius = rng.nextFloat(20, 45);

      this.pads.push({
        x,
        y,
        radius,
        angle: rng.nextFloat(0, Math.PI * 2),
        bobSpeed: rng.nextFloat(0.001, 0.002),
        bobOffset: rng.nextFloat(0, Math.PI * 2),
        wobble: 0,
        wobbleDecay: 0.95,
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

      // Draw shadow
      this.ctx.save();
      this.ctx.fillStyle = this.colorScheme.padShadow;
      this.ctx.beginPath();
      this.ctx.ellipse(pad.x, y + 5, pad.radius * 0.95, pad.radius * 0.4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Draw lily pad
      this.drawLilyPad(pad.x, y, pad.radius, pad.angle);
    }
  }

  /**
   * Draw a single lily pad with notch
   */
  private drawLilyPad(x: number, y: number, radius: number, angle: number) {
    this.ctx.save();

    // Main pad circle
    this.ctx.fillStyle = this.colorScheme.padColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add notch (wedge cut out)
    this.ctx.fillStyle = this.colorScheme.waterBottom;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, angle, angle + Math.PI / 4);
    this.ctx.closePath();
    this.ctx.fill();

    // Add some detail lines
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const lineAngle = (Math.PI * 2 * i) / 6;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        x + Math.cos(lineAngle) * radius * 0.9,
        y + Math.sin(lineAngle) * radius * 0.9
      );
      this.ctx.stroke();
    }

    // Highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
