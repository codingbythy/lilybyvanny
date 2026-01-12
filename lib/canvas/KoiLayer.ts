import { SeededRandom } from '../random';

interface Koi {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  color: string;
  targetAngle: number;
  turnSpeed: number;
  swimPhase: number;
}

/**
 * Renders swimming koi fish
 */
export class KoiLayer {
  private koi: Koi[] = [];
  private time: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    enabled: boolean,
    seed: string
  ) {
    if (enabled) {
      this.generateKoi(seed);
    }
  }

  /**
   * Generate 1-3 koi with deterministic properties
   */
  private generateKoi(seed: string) {
    const rng = new SeededRandom(seed + '_koi');
    const count = rng.nextInt(1, 3);
    this.koi = [];

    const colors = ['#FF6B35', '#FFA500', '#FFD700', '#FF4500'];
    const waterTop = this.height * 0.4;
    const waterHeight = this.height * 0.6;

    for (let i = 0; i < count; i++) {
      const x = rng.nextFloat(0.1 * this.width, 0.9 * this.width);
      const y = waterTop + rng.nextFloat(0.2 * waterHeight, 0.8 * waterHeight);

      this.koi.push({
        x,
        y,
        angle: rng.nextFloat(0, Math.PI * 2),
        speed: rng.nextFloat(0.3, 0.6),
        length: rng.nextFloat(30, 50),
        color: colors[rng.nextInt(0, colors.length - 1)],
        targetAngle: rng.nextFloat(0, Math.PI * 2),
        turnSpeed: 0.02,
        swimPhase: rng.nextFloat(0, Math.PI * 2),
      });
    }
  }

  /**
   * Update dimensions and regenerate koi
   */
  resize(width: number, height: number, enabled: boolean, seed: string) {
    this.width = width;
    this.height = height;
    this.koi = [];
    if (enabled) {
      this.generateKoi(seed);
    }
  }

  /**
   * Update and render koi
   */
  render(deltaTime: number) {
    if (this.koi.length === 0) return;

    this.time += deltaTime;

    for (const fish of this.koi) {
      // Update swim phase
      fish.swimPhase += 0.1;

      // Gradually turn toward target angle
      let angleDiff = fish.targetAngle - fish.angle;
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      fish.angle += angleDiff * fish.turnSpeed;

      // Move forward
      fish.x += Math.cos(fish.angle) * fish.speed;
      fish.y += Math.sin(fish.angle) * fish.speed;

      // Bounce off edges and pick new target
      const waterTop = this.height * 0.4;
      const waterBottom = this.height;

      if (fish.x < 0 || fish.x > this.width || fish.y < waterTop || fish.y > waterBottom) {
        fish.x = Math.max(0, Math.min(this.width, fish.x));
        fish.y = Math.max(waterTop, Math.min(waterBottom, fish.y));
        fish.targetAngle = Math.random() * Math.PI * 2;
      }

      // Occasionally change direction
      if (Math.random() < 0.01) {
        fish.targetAngle = Math.random() * Math.PI * 2;
      }

      // Draw the koi
      this.drawKoi(fish);
    }
  }

  /**
   * Draw a single koi fish
   */
  private drawKoi(fish: Koi) {
    this.ctx.save();
    this.ctx.translate(fish.x, fish.y);
    this.ctx.rotate(fish.angle);

    // Body wave for swimming motion
    const tailWave = Math.sin(fish.swimPhase) * 0.2;

    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(2, 5, fish.length * 0.5, fish.length * 0.2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = fish.color;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, fish.length * 0.5, fish.length * 0.2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Tail
    this.ctx.save();
    this.ctx.translate(-fish.length * 0.5, 0);
    this.ctx.rotate(tailWave);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-fish.length * 0.3, -fish.length * 0.2);
    this.ctx.lineTo(-fish.length * 0.3, fish.length * 0.2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // Eye
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(fish.length * 0.3, -fish.length * 0.05, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Highlight on body
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(fish.length * 0.1, -fish.length * 0.1, fish.length * 0.2, fish.length * 0.1, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
