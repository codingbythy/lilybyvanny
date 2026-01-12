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

    // Calculate responsive font size - larger and more prominent
    const baseFontSize = Math.min(this.width / 20, 32);
    const fontSize = Math.max(18, baseFontSize);

    this.ctx.font = `italic bold ${fontSize}px Georgia, serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Position near bottom
    const y = this.height - 40;

    // Draw background box for better readability
    const textMetrics = this.ctx.measureText(this.text);
    const padding = 15;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = fontSize + padding;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = y - boxHeight;

    // Semi-transparent background with rounded corners
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();

    // Add subtle border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Draw text shadow for depth
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillText(this.text, this.width / 2 + 2, y - 8 + 2);

    // Draw main text with brighter color
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(this.text, this.width / 2, y - 8);

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
