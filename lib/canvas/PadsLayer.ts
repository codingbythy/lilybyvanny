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

      // Draw shadow
      this.ctx.save();
      this.ctx.fillStyle = this.colorScheme.padShadow;
      this.ctx.beginPath();
      this.ctx.ellipse(pad.x, y + 5, pad.radius * 0.95, pad.radius * 0.4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Draw lily pad
      this.drawLilyPad(pad.x, y, pad.radius, pad.angle, pad.hasFlower, pad.flowerColor);
    }
  }

  /**
   * Draw a single lily pad with notch and optional flower
   */
  private drawLilyPad(x: number, y: number, radius: number, angle: number, hasFlower: boolean, flowerColor: string) {
    this.ctx.save();

    // Main pad circle with gradient for depth
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.colorScheme.padColor);
    gradient.addColorStop(0.6, this.colorScheme.padColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add notch (wedge cut out) with smoother edge
    this.ctx.fillStyle = this.colorScheme.waterBottom;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, angle, angle + Math.PI / 5);
    this.ctx.closePath();
    this.ctx.fill();

    // Add darker border around notch
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, angle, angle + Math.PI / 5);
    this.ctx.stroke();

    // Add radial vein details
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const lineAngle = (Math.PI * 2 * i) / 8;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        x + Math.cos(lineAngle) * radius * 0.85,
        y + Math.sin(lineAngle) * radius * 0.85
      );
      this.ctx.stroke();
    }

    // Outer rim detail
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    this.ctx.stroke();

    // Highlight for glossy effect
    const highlightGradient = this.ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      0,
      x - radius * 0.3,
      y - radius * 0.3,
      radius * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = highlightGradient;
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw flower if present
    if (hasFlower) {
      this.drawLilyFlower(x + radius * 0.2, y - radius * 0.1, radius * 0.35, flowerColor);
    }

    this.ctx.restore();
  }

  /**
   * Draw a beautiful watercolor-style lily flower (like the bouquet)
   */
  private drawLilyFlower(x: number, y: number, size: number, color: string) {
    this.ctx.save();

    // Draw petals with watercolor style - irregular and organic
    const numPetals = 6;
    for (let i = 0; i < numPetals; i++) {
      const angle = (Math.PI * 2 * i) / numPetals - Math.PI / 2;
      const petalLength = size * (0.8 + Math.sin(i) * 0.2); // Vary petal sizes
      const petalX = x + Math.cos(angle) * size * 0.25;
      const petalY = y + Math.sin(angle) * size * 0.25;

      // Soft watercolor gradient for each petal
      const petalGradient = this.ctx.createRadialGradient(
        petalX,
        petalY,
        0,
        petalX,
        petalY,
        petalLength
      );

      // Softer, more pastel colors
      const lighterColor = this.lightenColor(color, 30);
      petalGradient.addColorStop(0, lighterColor);
      petalGradient.addColorStop(0.5, color);
      petalGradient.addColorStop(0.8, color);
      petalGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');

      this.ctx.fillStyle = petalGradient;

      // Draw petal with soft, organic shape
      this.ctx.beginPath();
      this.ctx.ellipse(
        petalX,
        petalY,
        petalLength,
        petalLength * 0.6,
        angle,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Soft petal outline for watercolor effect
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Center of flower with warm yellow/gold
    const centerSize = size * 0.35;
    const centerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, centerSize);
    centerGradient.addColorStop(0, '#FFE97F');
    centerGradient.addColorStop(0.4, '#FFD54F');
    centerGradient.addColorStop(0.7, '#FFA000');
    centerGradient.addColorStop(1, '#FF8F00');

    this.ctx.fillStyle = centerGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, centerSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Add texture to center with small dots (stamens)
    this.ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
    const stamenCount = 12;
    for (let i = 0; i < stamenCount; i++) {
      const stamenAngle = (Math.PI * 2 * i) / stamenCount + Math.sin(i) * 0.3;
      const stamenDist = centerSize * (0.5 + Math.random() * 0.3);
      const dotX = x + Math.cos(stamenAngle) * stamenDist;
      const dotY = y + Math.sin(stamenAngle) * stamenDist;
      const dotSize = size * (0.06 + Math.random() * 0.04);

      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Add subtle watercolor texture overlay
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 15; i++) {
      const texX = x + (Math.random() - 0.5) * size * 1.5;
      const texY = y + (Math.random() - 0.5) * size * 1.5;
      const texSize = Math.random() * size * 0.15;

      this.ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)';
      this.ctx.beginPath();
      this.ctx.arc(texX, texY, texSize, 0, Math.PI * 2);
      this.ctx.fill();
    }

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
