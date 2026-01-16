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
  private readonly AVOIDANCE_DISTANCE = 80; // Distance at which koi start avoiding each other

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
   * Generate 20 koi with deterministic properties
   */
  private generateKoi(seed: string) {
    const rng = new SeededRandom(seed + '_koi');
    const count = 20; // Fixed count of 20 koi
    this.koi = [];

    const colors = ['#FF6B35', '#FF8C42', '#FFA500', '#FFD700', '#FF4500', '#E63946'];
    const waterTop = this.height * 0.15;
    const waterHeight = this.height * 0.85;

    for (let i = 0; i < count; i++) {
      const x = rng.nextFloat(0.1 * this.width, 0.9 * this.width);
      const y = waterTop + rng.nextFloat(0.2 * waterHeight, 0.8 * waterHeight);

      this.koi.push({
        x,
        y,
        angle: rng.nextFloat(0, Math.PI * 2),
        speed: rng.nextFloat(0.3, 0.6), // Slightly slower for more graceful movement
        length: rng.nextFloat(25, 40), // Smaller size to avoid overcrowding
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

    for (let i = 0; i < this.koi.length; i++) {
      const fish = this.koi[i];

      // Update swim phase
      fish.swimPhase += 0.1;

      // Check for nearby fish and calculate avoidance
      let avoidanceAngle: number | null = null;
      let closestDistance = this.AVOIDANCE_DISTANCE;

      for (let j = 0; j < this.koi.length; j++) {
        if (i === j) continue; // Skip self

        const other = this.koi[j];
        const dx = fish.x - other.x;
        const dy = fish.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If another fish is too close, calculate escape direction
        if (distance < this.AVOIDANCE_DISTANCE && distance < closestDistance) {
          closestDistance = distance;
          // Angle pointing away from the other fish
          avoidanceAngle = Math.atan2(dy, dx);
        }
      }

      // If we need to avoid, set target angle to escape direction
      if (avoidanceAngle !== null) {
        fish.targetAngle = avoidanceAngle;
      } else {
        // Occasionally change direction when not avoiding
        if (Math.random() < 0.01) {
          fish.targetAngle = Math.random() * Math.PI * 2;
        }
      }

      // Gradually turn toward target angle
      let angleDiff = fish.targetAngle - fish.angle;
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      fish.angle += angleDiff * fish.turnSpeed;

      // Move forward
      fish.x += Math.cos(fish.angle) * fish.speed;
      fish.y += Math.sin(fish.angle) * fish.speed;

      // Bounce off edges and pick new target
      const waterTop = this.height * 0.15;
      const waterBottom = this.height;

      if (fish.x < 0 || fish.x > this.width || fish.y < waterTop || fish.y > waterBottom) {
        fish.x = Math.max(0, Math.min(this.width, fish.x));
        fish.y = Math.max(waterTop, Math.min(waterBottom, fish.y));
        fish.targetAngle = Math.random() * Math.PI * 2;
      }

      // Draw the koi
      this.drawKoi(fish);
    }
  }

  /**
   * Draw a single koi fish with beautiful details
   */
  private drawKoi(fish: Koi) {
    this.ctx.save();
    this.ctx.translate(fish.x, fish.y);
    this.ctx.rotate(fish.angle);

    // Body wave for swimming motion
    const tailWave = Math.sin(fish.swimPhase) * 0.25;

    // Shadow (larger and softer)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(3, 6, fish.length * 0.5, fish.length * 0.22, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body with gradient
    const bodyGradient = this.ctx.createLinearGradient(
      -fish.length * 0.5,
      -fish.length * 0.2,
      fish.length * 0.5,
      fish.length * 0.2
    );
    bodyGradient.addColorStop(0, fish.color);
    bodyGradient.addColorStop(0.5, fish.color);
    bodyGradient.addColorStop(1, this.darkenColor(fish.color));

    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, fish.length * 0.5, fish.length * 0.22, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body outline for definition
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // White belly patch
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, fish.length * 0.08, fish.length * 0.35, fish.length * 0.12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Tail with gradient
    this.ctx.save();
    this.ctx.translate(-fish.length * 0.5, 0);
    this.ctx.rotate(tailWave);

    const tailGradient = this.ctx.createLinearGradient(0, -fish.length * 0.2, -fish.length * 0.3, 0);
    tailGradient.addColorStop(0, fish.color);
    tailGradient.addColorStop(1, this.darkenColor(fish.color));

    this.ctx.fillStyle = tailGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-fish.length * 0.35, -fish.length * 0.25);
    this.ctx.lineTo(-fish.length * 0.35, fish.length * 0.25);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();

    // Dorsal fin
    this.ctx.fillStyle = fish.color;
    this.ctx.beginPath();
    this.ctx.moveTo(fish.length * 0.1, -fish.length * 0.2);
    this.ctx.lineTo(fish.length * 0.05, -fish.length * 0.35);
    this.ctx.lineTo(fish.length * 0.15, -fish.length * 0.2);
    this.ctx.closePath();
    this.ctx.fill();

    // Eye (larger and more prominent)
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(fish.length * 0.35, -fish.length * 0.08, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(fish.length * 0.36, -fish.length * 0.09, 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Highlight on body (glossy effect)
    const highlightGradient = this.ctx.createRadialGradient(
      fish.length * 0.1,
      -fish.length * 0.12,
      0,
      fish.length * 0.1,
      -fish.length * 0.12,
      fish.length * 0.3
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = highlightGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(fish.length * 0.1, -fish.length * 0.12, fish.length * 0.25, fish.length * 0.12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Darken a hex color for gradients
   */
  private darkenColor(color: string): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
