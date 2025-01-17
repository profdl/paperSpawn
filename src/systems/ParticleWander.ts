import { ParticleType, SimulationSettings } from '../types/particle';

export class ParticleWander {
  static applyWanderBehavior(
    particle: ParticleType,
    settings: SimulationSettings
  ): { vx: number; vy: number } {
    if (!settings.wanderEnabled) {
      return { vx: 0, vy: 0 };
    }

    // Initialize wander angle if not set
    if (particle.wanderAngle === undefined) {
      particle.wanderAngle = Math.random() * Math.PI * 2;
    }

    // Update wander angle with smooth random changes
    const wanderDelta = (Math.random() - 0.5) * settings.wanderSpeed * 0.1;
    particle.wanderAngle += wanderDelta;

    // Calculate current movement angle
    const currentAngle = Math.atan2(particle.vy, particle.vx);

    // Calculate wander point around the particle
    const centerX = particle.x + Math.cos(currentAngle) * settings.wanderRadius;
    const centerY = particle.y + Math.sin(currentAngle) * settings.wanderRadius;

    // Calculate target point on the wander circle
    const targetX = centerX + Math.cos(particle.wanderAngle) * settings.wanderRadius;
    const targetY = centerY + Math.sin(particle.wanderAngle) * settings.wanderRadius;

    // Calculate desired angle towards the target
    const desiredAngle = Math.atan2(targetY - particle.y, targetX - particle.x);

    // Apply turn rate limitation
    let angleDiff = desiredAngle - currentAngle;
    // Normalize angle difference to [-π, π]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    // Limit the turn rate
    const maxTurnRate = settings.turnRate * Math.PI;
    if (Math.abs(angleDiff) > maxTurnRate) {
      angleDiff = Math.sign(angleDiff) * maxTurnRate;
    }

    // Calculate new angle after turn rate limitation
    const newAngle = currentAngle + angleDiff;

    // Calculate force vector with limited turning
    const strength = settings.wanderStrength * 0.5;
    const vx = Math.cos(newAngle) * strength;
    const vy = Math.sin(newAngle) * strength;

    return { vx, vy };
  }
}