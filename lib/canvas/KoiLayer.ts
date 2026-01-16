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
  repulsionAngle: number | null; // Angle to flee from click
  repulsionStrength: number; // How strongly to flee
}

/**
 * Renders swimming koi fish
 */
export class KoiLayer {
  private koi: Koi[] = [];
  private time: number = 0;
  private readonly AVOIDANCE_DISTANCE = 80; // Distance at which koi start avoiding each other
  private readonly REPULSION_DISTANCE = 150; // Distance at which koi flee from clicks

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
        repulsionAngle: null,
        repulsionStrength: 0,
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
   * Handle click to make fish flee from click position
   */
  handleClick(clickX: number, clickY: number) {
    for (const fish of this.koi) {
      const dx = fish.x - clickX;
      const dy = fish.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If fish is within repulsion distance, make it flee
      if (distance < this.REPULSION_DISTANCE) {
        // Calculate angle away from click
        fish.repulsionAngle = Math.atan2(dy, dx);
        // Stronger repulsion if closer to click
        fish.repulsionStrength = 1.0 - (distance / this.REPULSION_DISTANCE);
      }
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

      // PRIORITY 1: Repulsion from clicks (highest priority)
      if (fish.repulsionStrength > 0) {
        if (fish.repulsionAngle !== null) {
          fish.targetAngle = fish.repulsionAngle;
        }
        // Decay repulsion over time
        fish.repulsionStrength *= 0.95;
        if (fish.repulsionStrength < 0.01) {
          fish.repulsionStrength = 0;
          fish.repulsionAngle = null;
        }
      }
      // PRIORITY 2: Check for nearby fish and calculate avoidance
      else {
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
   * Draw a pixelated koi fish (8-bit style)
   */
  private drawKoi(fish: Koi) {
    this.ctx.save();
    this.ctx.translate(fish.x, fish.y);
    this.ctx.rotate(fish.angle);

    const pixelSize = 4;
    const bodyLength = Math.floor(fish.length / pixelSize);
    const bodyHeight = Math.floor((fish.length * 0.4) / pixelSize);

    // Draw simple pixelated fish body (horizontal rectangle)
    this.ctx.fillStyle = fish.color;

    // Body pixels
    for (let x = -bodyLength / 2; x < bodyLength / 2; x++) {
      for (let y = -bodyHeight / 2; y < bodyHeight / 2; y++) {
        // Create fish shape - narrower at ends
        const distFromCenter = Math.abs(x) / (bodyLength / 2);
        const maxY = (bodyHeight / 2) * (1 - distFromCenter * 0.6);

        if (Math.abs(y) < maxY) {
          this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Tail (simple triangle in pixels)
    const tailWave = Math.sin(fish.swimPhase) > 0 ? 1 : -1;
    this.ctx.fillStyle = this.darkenColor(fish.color);

    for (let i = 0; i < 3; i++) {
      this.ctx.fillRect(
        (-bodyLength / 2 - i - 1) * pixelSize,
        tailWave * i * pixelSize,
        pixelSize,
        pixelSize
      );
      this.ctx.fillRect(
        (-bodyLength / 2 - i - 1) * pixelSize,
        -tailWave * i * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    // Eye (single white pixel with black outline)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect((bodyLength / 2 - 2) * pixelSize, -pixelSize, pixelSize, pixelSize);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect((bodyLength / 2 - 2) * pixelSize + 1, -pixelSize + 1, pixelSize - 2, pixelSize - 2);

    // Simple dorsal fin (few pixels sticking up)
    this.ctx.fillStyle = fish.color;
    this.ctx.fillRect(pixelSize, -bodyHeight / 2 * pixelSize - pixelSize, pixelSize, pixelSize);
    this.ctx.fillRect(0, -bodyHeight / 2 * pixelSize - pixelSize * 2, pixelSize, pixelSize);

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
