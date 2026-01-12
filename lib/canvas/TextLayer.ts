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

    // Calculate responsive font size
    const baseFontSize = Math.min(this.width / 25, 24);
    const fontSize = Math.max(14, baseFontSize);

    this.ctx.font = `italic ${fontSize}px Georgia, serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Position near bottom
    const y = this.height - 30;

    // Draw text shadow for better readability
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillText(this.text, this.width / 2 + 1, y + 1);

    // Draw main text
    this.ctx.fillStyle = this.colorScheme.textColor;
    this.ctx.fillText(this.text, this.width / 2, y);

    this.ctx.restore();
  }
}
