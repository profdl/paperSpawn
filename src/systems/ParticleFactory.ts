import { ParticleType, SpawnPattern } from '../types/particle';

export class ParticleFactory {
  static createParticle(x: number, y: number): ParticleType {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      sensorAngle: Math.PI / 4,
      sensorDistance: 20,
      state: 'active',
      createdAt: Date.now(),
      opacity: 1.0
    };
  }

  static createParticles(count: number, width: number, height: number, pattern: SpawnPattern): ParticleType[] {
    switch (pattern) {
      case 'grid':
        return this.createGridParticles(count, width, height);
      case 'circle':
        return this.createCircleParticles(count, width, height);
      case 'point':
        return this.createPointParticles(count, width, height);
      case 'scatter':
      default:
        return this.createScatterParticles(count, width, height);
    }
  }

  private static createScatterParticles(count: number, width: number, height: number): ParticleType[] {
    return Array.from({ length: count }, () => this.createParticle(
      Math.random() * width,
      Math.random() * height
    ));
  }

  private static createGridParticles(count: number, width: number, height: number): ParticleType[] {
    const particles: ParticleType[] = [];
    const cols = Math.ceil(Math.sqrt(count * width / height));
    const rows = Math.ceil(count / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      particles.push(this.createParticle(
        (col + 0.5) * cellWidth,
        (row + 0.5) * cellHeight
      ));
    }
    return particles;
  }

  private static createCircleParticles(count: number, width: number, height: number): ParticleType[] {
    const particles: ParticleType[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const particle = this.createParticle(x, y);
      particle.vx = Math.cos(angle) * 2;
      particle.vy = Math.sin(angle) * 2;
      particle.angle = angle;
      particles.push(particle);
    }
    return particles;
  }

  private static createPointParticles(count: number, width: number, height: number): ParticleType[] {
    const particles: ParticleType[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const particle = this.createParticle(
        centerX + (Math.random() - 0.5) * 10,
        centerY + (Math.random() - 0.5) * 10
      );
      particle.vx = Math.cos(angle) * 2;
      particle.vy = Math.sin(angle) * 2;
      particle.angle = angle;
      particles.push(particle);
    }
    return particles;
  }
}