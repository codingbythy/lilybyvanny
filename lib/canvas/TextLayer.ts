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
   * Render dedication text
   */
  render() {
    if (!this.text || this.text.trim().length === 0) return;

    this.ctx.save();

    // Calculate responsive font size - handwritten style
    const baseFontSize = Math.min(this.width / 18, 36);
    const fontSize = Math.max(20, baseFontSize);

    // Use handwritten font like in the bouquet
    this.ctx.font = `${fontSize}px 'Patrick Hand', 'Caveat', cursive`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Position near bottom
    const y = this.height - 50;

    // Draw background box - cream/beige like the bouquet card
    const textMetrics = this.ctx.measureText(this.text);
    const padding = 20;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = fontSize + padding + 10;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = y - boxHeight;

    // Cream background with slight transparency
    this.ctx.fillStyle = 'rgba(245, 240, 230, 0.95)';
    this.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
    this.ctx.fill();

    // Add border like the bouquet card
    this.ctx.strokeStyle = 'rgba(60, 60, 60, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw text in dark color (not pure black, more natural)
    this.ctx.fillStyle = '#2c2c2c';
    this.ctx.fillText(this.text, this.width / 2, y - 15);

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
