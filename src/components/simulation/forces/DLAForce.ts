import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class DLAForce {
  private static readonly STICKING_DISTANCE = 2; // Distance at which particles stick

  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    // Skip calculation for seed particles or already stuck particles
    if (particle.data.isSeed || particle.data.isStuck) {
      particle.data.velocity = new paper.Point(0, 0);
      return new paper.Point(0, 0);
    }

    // Check distance to all seed and stuck particles
    for (const other of particles.children) {
      if (other === particle) continue;
      if (other.data.isSeed || other.data.isStuck) {
        const distance = particle.position.getDistance(other.position);
        if (distance < STICKING_DISTANCE) {
          // Particle becomes stuck
          particle.data.isStuck = true;
          particle.data.velocity = new paper.Point(0, 0);
          return new paper.Point(0, 0);
        }
      }
    }

    // If not stuck, return zero force (particle will continue moving with its current velocity)
    return new paper.Point(0, 0);
  }
}
