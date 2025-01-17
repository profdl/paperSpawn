import { ParticleType, SimulationSettings, SpawnPattern } from '../types/particle';
import { ParticleFactory } from './ParticleFactory';
import { ParticleStateManager } from './ParticleStateManager';

export class ParticleSystem {
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
    const particles: ParticleType[] = [];

    switch (pattern) {
      case 'grid': {
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
        break;
      }

      case 'circle': {
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
        break;
      }

      case 'point': {
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
        break;
      }

      case 'scatter':
      default: {
        for (let i = 0; i < count; i++) {
          particles.push(this.createParticle(
            Math.random() * width,
            Math.random() * height
          ));
        }
        break;
      }
    }

    return particles;
  }

  static updateParticles(
    particles: ParticleType[],
    settings: SimulationSettings,
    width: number,
    height: number
  ): ParticleType[] {
    // Update particles and filter out any that have been marked for removal
    return particles
      .map(particle => 
        ParticleStateManager.updateParticleState(particle, particles, settings, width, height)
      )
      .filter(particle => particle.opacity > 0); // Remove particles with zero opacity
  }
}