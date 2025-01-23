import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class ExternalForce {
  static calculate(settings: SimulationSettings, particle: paper.Group): paper.Point {
    const baseAngle = settings.externalForceAngle || 0;
    const randomizeRange = settings.externalForceAngleRandomize || 0;
    const strength = settings.externalForceStrength || 0;
  
    let randomOffset;
    if (!particle.data.externalForceAngleOffset) {
      randomOffset = (Math.random() * 2 - 1) * randomizeRange;
      particle.data.externalForceAngleOffset = randomOffset;
    } else {
      randomOffset = particle.data.externalForceAngleOffset;
    }

    const finalAngle = baseAngle + randomOffset;
  
    return new paper.Point({
      length: strength * 10,
      angle: finalAngle
    });
  }
}