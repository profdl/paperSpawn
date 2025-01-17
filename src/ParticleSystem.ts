import { ParticleType, SimulationSettings, SpawnPattern } from './types/particle';
import { ParticleFactory } from './systems/ParticleFactory';
import { ParticleStateManager } from './systems/ParticleStateManager';

export class ParticleSystem {
  static createParticle(x: number, y: number): ParticleType {
    return ParticleFactory.createParticle(x, y);
  }

  static createParticles(count: number, width: number, height: number, pattern: SpawnPattern): ParticleType[] {
    return ParticleFactory.createParticles(count, width, height, pattern);
  }

  static updateParticles(
    particles: ParticleType[],
    settings: SimulationSettings,
    width: number,
    height: number
  ): ParticleType[] {
    return particles.map(particle => 
      ParticleStateManager.updateParticleState(particle, particles, settings, width, height)
    );
  }
}