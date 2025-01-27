import paper from 'paper';
import { SimulationSettings } from '../../types';

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
      const forceMagnitude = baseForceMagnitude * distanceScale * settings.magnetismStrength;
      
      // Direct attraction towards nearest particle
      const force = diff.normalize().multiply(forceMagnitude);
      
      console.log('Magnetism Details:', {
        nearestDistance,
        forceMagnitude,
        force: {
          x: force.x,
          y: force.y,
          length: force.length
        }
      });
      
      return force;
    }
    
    return magneticForce;
  }
}