import paper from 'paper';
import { SimulationSettings, FlockingForces } from '../../types';

export class FlockingForce {
  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): FlockingForces {
    let separation = new paper.Point(0, 0);
    let cohesion = new paper.Point(0, 0);
    let alignment = new paper.Point(0, 0);
    let neighbors = 0;

    const particlePos = (particle.children[0] as paper.Path.Circle).position;
    const velocity = particle.data.velocity;
    const halfSensorAngle = (settings.sensorAngle * Math.PI / 180) / 2;

    particles.children.forEach(other => {
      if (particle === other || other.data.state === 'frozen') return;

      const otherPos = (other.children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);
      const distance = diff.length;

      let angleToOther = Math.atan2(diff.y, diff.x);
      let currentAngle = Math.atan2(velocity.y, velocity.x);

      let angleDiff = angleToOther - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) <= halfSensorAngle) {
        if (distance < settings.separationDistance) {
          const force = (settings.separationDistance - distance) / settings.separationDistance;
          separation = separation.subtract(diff.multiply(force));
        }

        if (distance < settings.cohesionDistance) {
          cohesion = cohesion.add(otherPos);
          neighbors++;
        }

        if (distance < settings.alignmentDistance) {
          alignment = alignment.add(other.data.velocity);
        }
      }
    });

    if (neighbors > 0) {
      cohesion = cohesion.divide(neighbors).subtract(particlePos);
      alignment = alignment.divide(neighbors);
    }

    return {
      separation: separation.normalize(),
      cohesion: cohesion.normalize(),
      alignment: alignment.normalize()
    };
  }
}