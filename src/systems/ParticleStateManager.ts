import { ParticleType, SimulationSettings } from '../types/particle';
import { ParticlePhysics } from './ParticlePhysics';
import { ParticleWander } from './ParticleWander';

export class ParticleStateManager {
  static updateParticleState(
    particle: ParticleType,
    particles: ParticleType[],
    settings: SimulationSettings,
    width: number,
    height: number
  ): ParticleType {
    const now = Date.now();
    const age = now - particle.createdAt;
    const newParticle = { ...particle };

    if (settings.paintingModeEnabled) {
      if (particle.state === 'active' && age >= settings.activeStateDuration) {
        newParticle.state = 'freezing';
      } else if (particle.state === 'freezing' && age >= settings.activeStateDuration + settings.freezingDuration) {
        newParticle.state = 'frozen';
      }
    }

    if (!settings.paintingModeEnabled || newParticle.state !== 'frozen') {
      let { vx, vy } = particle;

      if (settings.slimeBehavior) {
        const slimeBehavior = ParticlePhysics.calculateSlimeBehavior(particle, particles, settings);
        newParticle.angle = slimeBehavior.angle;
        vx = slimeBehavior.vx;
        vy = slimeBehavior.vy;
      }

      if (settings.flockingEnabled) {
        const flockingForces = ParticlePhysics.calculateFlockingForces(particle, particles, settings);
        vx = flockingForces.vx;
        vy = flockingForces.vy;
      }

      if (settings.wanderEnabled) {
        const wanderForces = ParticleWander.applyWanderBehavior(particle, settings);
        vx += wanderForces.vx;
        vy += wanderForces.vy;
      }

      let speedMultiplier = settings.speed;
      if (settings.paintingModeEnabled && newParticle.state === 'freezing') {
        const freezingProgress = (age - settings.activeStateDuration) / settings.freezingDuration;
        speedMultiplier *= (1 - freezingProgress);
      }

      const normalizedVelocity = ParticlePhysics.normalizeVelocity(vx, vy, speedMultiplier);
      newParticle.vx = normalizedVelocity.vx;
      newParticle.vy = normalizedVelocity.vy;

      // Calculate next position
      const nextX = newParticle.x + newParticle.vx;
      const nextY = newParticle.y + newParticle.vy;

      // Apply boundary behavior
      switch (settings.boundaryBehavior) {
        case 'travel-off':
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            newParticle.opacity = 0;
          } else {
            newParticle.x = nextX;
            newParticle.y = nextY;
          }
          break;

        case 'wrap-around':
          newParticle.x = ((nextX + width) % width);
          newParticle.y = ((nextY + height) % height);
          break;

        case 'bounce':
          // Handle X-axis bounce
          if (nextX < 0) {
            newParticle.x = -nextX;
            newParticle.vx = Math.abs(newParticle.vx);
            if (settings.slimeBehavior) {
              newParticle.angle = Math.PI - newParticle.angle;
            }
          } else if (nextX >= width) {
            newParticle.x = width - (nextX - width);
            newParticle.vx = -Math.abs(newParticle.vx);
            if (settings.slimeBehavior) {
              newParticle.angle = Math.PI - newParticle.angle;
            }
          } else {
            newParticle.x = nextX;
          }

          // Handle Y-axis bounce
          if (nextY < 0) {
            newParticle.y = -nextY;
            newParticle.vy = Math.abs(newParticle.vy);
            if (settings.slimeBehavior) {
              newParticle.angle = -newParticle.angle;
            }
          } else if (nextY >= height) {
            newParticle.y = height - (nextY - height);
            newParticle.vy = -Math.abs(newParticle.vy);
            if (settings.slimeBehavior) {
              newParticle.angle = -newParticle.angle;
            }
          } else {
            newParticle.y = nextY;
          }
          break;

        case 'stop':
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            newParticle.x = Math.max(0, Math.min(width - 1, nextX));
            newParticle.y = Math.max(0, Math.min(height - 1, nextY));
            newParticle.vx = 0;
            newParticle.vy = 0;
          } else {
            newParticle.x = nextX;
            newParticle.y = nextY;
          }
          break;
      }
    }

    if (settings.paintingModeEnabled) {
      if (newParticle.state === 'frozen') {
        newParticle.opacity = settings.trailPersistence;
      } else if (newParticle.state === 'freezing') {
        const freezingProgress = (age - settings.activeStateDuration) / settings.freezingDuration;
        newParticle.opacity = 1 - (1 - settings.trailPersistence) * freezingProgress;
      }
    } else {
      newParticle.opacity = 1.0;
    }

    return newParticle;
  }
}