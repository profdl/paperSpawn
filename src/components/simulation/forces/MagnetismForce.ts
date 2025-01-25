import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class MagnetismForce {
  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.magnetismEnabled) return new paper.Point(0, 0);

    const magneticForce = new paper.Point(0, 0);
    const particlePos = (particle.children[0] as paper.Path.Circle).position;
    let nearestParticle: paper.Group | null = null;
    let nearestDistance = Infinity;
    const magnetAngleRad = settings.sensorAngle * Math.PI / 180;

    // Find the nearest particle
    particles.children.forEach(other => {
      if (particle === other || !(other instanceof paper.Group)) return;

      const otherPos = (other.children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);
      const distance = diff.length;

      if (distance < settings.magnetismDistance && distance < nearestDistance) {
        nearestParticle = other;
        nearestDistance = distance;
      }
    });

    // If we found a nearby particle, apply strong attraction
    if (nearestParticle) {
      const otherPos = ((nearestParticle as paper.Group).children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);

      // Very strong base force
      const baseForceMagnitude = 1;

      // Stronger attraction when closer
      const distanceScale = Math.pow(1 - nearestDistance / settings.magnetismDistance, 0.5);

      // Create a magnetic field direction vector
      const fieldDirection = new paper.Point(
        Math.cos(magnetAngleRad),
        Math.sin(magnetAngleRad)
      );

      // Get current velocity direction
      const currentVelocity = particle.data.velocity;
      const currentDirection = currentVelocity.length > 0 ? currentVelocity.normalize() : new paper.Point(0, 0);

      // Calculate desired direction
      const normalizedDiff = diff.normalize();
      const blendedDirection = normalizedDiff
        .multiply(0.7)  // 70% direct attraction
        .add(fieldDirection.multiply(0.3));  // 30% field influence

      // Apply turn rate limitation
      const turnLimit = settings.turnRate;
      const maxTurnAngle = Math.PI * turnLimit;
      
      // Calculate angle between current and desired direction
      const currentAngle = Math.atan2(currentDirection.y, currentDirection.x);
      const targetAngle = Math.atan2(blendedDirection.y, blendedDirection.x);
      let angleDiff = targetAngle - currentAngle;
      
      // Normalize angle difference to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Limit the turn angle
      const limitedAngle = Math.max(-maxTurnAngle, Math.min(maxTurnAngle, angleDiff));
      const finalAngle = currentAngle + limitedAngle;
      
      // Create the final direction vector
      const finalDirection = new paper.Point(
        Math.cos(finalAngle),
        Math.sin(finalAngle)
      );

      const forceMagnitude = baseForceMagnitude * distanceScale * settings.magnetismStrength;

      // Apply force in the final direction
      const force = finalDirection.normalize().multiply(forceMagnitude);

      return force;
    }

    return magneticForce;
  }
}