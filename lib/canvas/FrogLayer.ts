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
   * Draw a smooth watercolor frog
   */
  private drawFrog(x: number, y: number, size: number, eyeState: number) {
    this.ctx.save();

    // Body with soft gradient
    const bodyGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    bodyGradient.addColorStop(0, '#5A9D4A');
    bodyGradient.addColorStop(0.6, '#4A7C3B');
    bodyGradient.addColorStop(1, '#3A6C2B');

    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Soft body outline
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Belly with gradient
    const bellyGradient = this.ctx.createRadialGradient(
      x, y + size * 0.2, 0,
      x, y + size * 0.2, size * 0.6
    );
    bellyGradient.addColorStop(0, '#C8E6C9');
    bellyGradient.addColorStop(0.7, '#A8D5A3');
    bellyGradient.addColorStop(1, 'rgba(168, 213, 163, 0)');

    this.ctx.fillStyle = bellyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size * 0.2, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    const eyeOffset = size * 0.4;
    const eyeSize = size * 0.3;

    // Left eye base
    const leftEyeGradient = this.ctx.createRadialGradient(
      x - eyeOffset, y - size * 0.3, 0,
      x - eyeOffset, y - size * 0.3, eyeSize
    );
    leftEyeGradient.addColorStop(0, '#4A7C3B');
    leftEyeGradient.addColorStop(1, '#3F5C2F');

    this.ctx.fillStyle = leftEyeGradient;
    this.ctx.beginPath();
    this.ctx.arc(x - eyeOffset, y - size * 0.3, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Right eye base
    const rightEyeGradient = this.ctx.createRadialGradient(
      x + eyeOffset, y - size * 0.3, 0,
      x + eyeOffset, y - size * 0.3, eyeSize
    );
    rightEyeGradient.addColorStop(0, '#4A7C3B');
    rightEyeGradient.addColorStop(1, '#3F5C2F');

    this.ctx.fillStyle = rightEyeGradient;
    this.ctx.beginPath();
    this.ctx.arc(x + eyeOffset, y - size * 0.3, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Pupils (with blink animation)
    if (eyeState < 0.5) {
      const pupilAlpha = 1 - (eyeState * 2);
      this.ctx.fillStyle = `rgba(0, 0, 0, ${pupilAlpha})`;

      // Left pupil
      this.ctx.beginPath();
      this.ctx.arc(x - eyeOffset, y - size * 0.3, eyeSize * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Right pupil
      this.ctx.beginPath();
      this.ctx.arc(x + eyeOffset, y - size * 0.3, eyeSize * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Eye highlights
      this.ctx.fillStyle = `rgba(255, 255, 255, ${pupilAlpha * 0.6})`;
      this.ctx.beginPath();
      this.ctx.arc(x - eyeOffset + eyeSize * 0.15, y - size * 0.3 - eyeSize * 0.15, eyeSize * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + eyeOffset + eyeSize * 0.15, y - size * 0.3 - eyeSize * 0.15, eyeSize * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Eyelids for blink (soft overlay)
    if (eyeState > 0) {
      this.ctx.fillStyle = '#4A7C3B';
      this.ctx.globalAlpha = eyeState;

      // Left eyelid
      this.ctx.beginPath();
      this.ctx.ellipse(
        x - eyeOffset, y - size * 0.3,
        eyeSize, eyeSize * (1 - eyeState * 0.8),
        0, 0, Math.PI * 2
      );
      this.ctx.fill();

      // Right eyelid
      this.ctx.beginPath();
      this.ctx.ellipse(
        x + eyeOffset, y - size * 0.3,
        eyeSize, eyeSize * (1 - eyeState * 0.8),
        0, 0, Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.globalAlpha = 1;
    }

    this.ctx.restore();
  }
}
