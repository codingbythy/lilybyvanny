import { ColorScheme } from '../types';

/**
 * Renders dedication text elegantly
 */
export class TextLayer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private colorScheme: ColorScheme,
    private text: string
  ) {}

  /**
   * Update dimensions
   */
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Update color scheme
   */
  updateColorScheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme;
  }

  /**
   * Update text
   */
  updateText(text: string) {
    this.text = text;
  }

  /**
   * Render dedication text (watercolor style)
   */
  render() {
    if (!this.text || this.text.trim().length === 0) return;

    this.ctx.save();

    // Calculate responsive font size - elegant style
    const baseFontSize = Math.min(this.width / 18, 32);
    const fontSize = Math.max(18, baseFontSize);

    // Use handwritten font for watercolor aesthetic
    this.ctx.font = `${fontSize}px 'Patrick Hand', 'Caveat', cursive, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Position near bottom
    const y = this.height - 50;

    // Draw soft watercolor background card
    const textMetrics = this.ctx.measureText(this.text);
    const padding = 20;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = fontSize + padding + 10;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = y - boxHeight;

    // Soft cream background with gradient
    const bgGradient = this.ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    bgGradient.addColorStop(0, 'rgba(250, 248, 245, 0.95)');
    bgGradient.addColorStop(1, 'rgba(245, 240, 235, 0.95)');

    this.ctx.fillStyle = bgGradient;
    this.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
    this.ctx.fill();

    // Soft border
    this.ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw text in natural dark color
    this.ctx.fillStyle = '#3c3c3c';
    this.ctx.fillText(this.text, this.width / 2, y - 15);

    // Subtle shadow for depth
    this.ctx.globalAlpha = 0.15;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(this.text, this.width / 2 + 1, y - 14);

    this.ctx.restore();
  }

  /**
   * Helper to draw rounded rectangle
   */
  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}
