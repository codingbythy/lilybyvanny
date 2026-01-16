import { SeededRandom } from '../random';

interface Frog {
  padIndex: number;
  offsetX: number;
  offsetY: number;
  size: number;
  eyeState: number; // 0 = open, gradually closes to 1 for blink
  nextBlinkTime: number;
}

/**
 * Renders frogs sitting on lily pads with blinking animation
 */
export class FrogLayer {
  private frogs: Frog[] = [];
  private time: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    enabled: boolean,
    padCount: number,
    seed: string
  ) {
    if (enabled && padCount > 0) {
      this.generateFrogs(padCount, seed);
    }
  }

  /**
   * Generate 0-5 frogs on random pads
   */
  private generateFrogs(padCount: number, seed: string) {
    const rng = new SeededRandom(seed + '_frogs');
    const frogCount = Math.min(rng.nextInt(0, 5), padCount);
    this.frogs = [];

    // Track which pads have frogs to avoid duplicates
    const usedPads = new Set<number>();

    for (let i = 0; i < frogCount; i++) {
      let padIndex;
      do {
        padIndex = rng.nextInt(0, padCount - 1);
      } while (usedPads.has(padIndex));
      usedPads.add(padIndex);

      this.frogs.push({
        padIndex,
        offsetX: rng.nextFloat(-5, 5),
        offsetY: rng.nextFloat(-5, 5),
        size: rng.nextFloat(8, 15),
        eyeState: 0,
        nextBlinkTime: rng.nextFloat(2000, 5000),
      });
    }
  }

  /**
   * Regenerate frogs
   */
  resize(enabled: boolean, padCount: number, seed: string) {
    this.frogs = [];
    if (enabled && padCount > 0) {
      this.generateFrogs(padCount, seed);
    }
  }

  /**
   * Update and render frogs
   */
  render(deltaTime: number, padPositions: Array<{ x: number; y: number; radius: number }>) {
    if (this.frogs.length === 0) return;

    this.time += deltaTime;

    for (const frog of this.frogs) {
      // Check if pad exists
      if (frog.padIndex >= padPositions.length) continue;

      const pad = padPositions[frog.padIndex];

      // Update blink animation
      if (this.time >= frog.nextBlinkTime) {
        // Start blinking
        frog.eyeState = Math.min(1, frog.eyeState + 0.2);

        if (frog.eyeState >= 1) {
          // Blink complete, reset
          frog.eyeState = 0;
          frog.nextBlinkTime = this.time + Math.random() * 3000 + 2000;
        }
      }

      // Draw frog on pad
      this.drawFrog(
        pad.x + frog.offsetX,
        pad.y + frog.offsetY,
        frog.size,
        frog.eyeState
      );
    }
  }

  /**
   * Draw a pixelated frog (8-bit style)
   */
  private drawFrog(x: number, y: number, size: number, eyeState: number) {
    this.ctx.save();
    const pixelSize = 4;

    // Snap to pixel grid
    const gridX = Math.floor(x / pixelSize) * pixelSize;
    const gridY = Math.floor(y / pixelSize) * pixelSize;
    const gridSize = Math.floor(size / pixelSize);

    // Body (simple oval shape with pixels)
    this.ctx.fillStyle = '#4A7C3B';
    for (let px = -gridSize; px <= gridSize; px++) {
      for (let py = -gridSize * 0.7; py <= gridSize * 0.7; py++) {
        const dist = (px * px) / (gridSize * gridSize) + (py * py) / ((gridSize * 0.7) ** 2);
        if (dist < 1) {
          this.ctx.fillRect(gridX + px * pixelSize, gridY + py * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Belly (lighter green)
    this.ctx.fillStyle = '#A8D5A3';
    const bellySize = gridSize * 0.6;
    for (let px = -bellySize; px <= bellySize; px++) {
      for (let py = 0; py <= bellySize; py++) {
        const dist = (px * px) / (bellySize * bellySize) + (py * py) / (bellySize * bellySize);
        if (dist < 1) {
          this.ctx.fillRect(gridX + px * pixelSize, gridY + py * pixelSize + size * 0.2, pixelSize, pixelSize);
        }
      }
    }

    // Eyes (simple squares)
    const eyeOffset = gridSize * 0.4 * pixelSize;
    const eyePixelSize = pixelSize * 2;

    // Left eye
    this.ctx.fillStyle = '#3F5C2F';
    this.ctx.fillRect(gridX - eyeOffset - eyePixelSize, gridY - size * 0.3 - eyePixelSize / 2, eyePixelSize, eyePixelSize);

    // Right eye
    this.ctx.fillRect(gridX + eyeOffset, gridY - size * 0.3 - eyePixelSize / 2, eyePixelSize, eyePixelSize);

    // Pupils (if eyes open)
    if (eyeState < 0.5) {
      this.ctx.fillStyle = '#000000';
      const pupilSize = pixelSize;

      // Left pupil
      this.ctx.fillRect(gridX - eyeOffset - pupilSize, gridY - size * 0.3 - pupilSize / 2, pupilSize, pupilSize);

      // Right pupil
      this.ctx.fillRect(gridX + eyeOffset + pupilSize / 2, gridY - size * 0.3 - pupilSize / 2, pupilSize, pupilSize);
    }

    this.ctx.restore();
  }
}
