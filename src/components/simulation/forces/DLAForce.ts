import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class DLAForce {
  private static readonly STICKING_DISTANCE = 2;

  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.dlaEnabled || particle.data.isSeed || particle.data.isStuck) {
      particle.data.velocity = new paper.Point(0, 0);
      return new paper.Point(0, 0);
    }

    for (const other of particles.children) {
      if (other === particle) continue;
      if (other.data.isSeed || other.data.isStuck) {
        const distance = particle.position.getDistance(other.position);
        if (distance < this.STICKING_DISTANCE) {
          particle.data.isStuck = true;
          particle.data.velocity = new paper.Point(0, 0);
          return new paper.Point(0, 0);
        }
      }
    }

    return new paper.Point(0, 0);
  }
}