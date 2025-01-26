import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class AggregationForce {
  private static initializeParticleData(particle: paper.Group): void {
    if (!particle.data) {
      particle.data = {};
    }
    
    if (particle.data.aggregatedParticles === undefined) {
      particle.data.aggregatedParticles = new Set<number>();
    }
  }

  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.aggregationEnabled) return new paper.Point(0, 0);

    this.initializeParticleData(particle);
    
    const point = particle.children[1] as paper.Path.Circle;
    let totalForce = new paper.Point(0, 0);
    const minDistance = settings.particleSize * settings.aggregationSpacing;
    const criticalDistance = settings.particleSize * 1.5; // Distance at which strong repulsion kicks in

    for (const otherParticle of particles.children as paper.Group[]) {
      if (particle === otherParticle) continue;
      
      const otherPoint = otherParticle.children[1] as paper.Path.Circle;
      const vectorToOther = otherPoint.position.subtract(point.position);
      const distance = vectorToOther.length;

      // Strong repulsion for very close particles (regardless of aggregation status)
      if (distance < criticalDistance) {
        const repulsionStrength = 0.5; // Increased repulsion strength
        const criticalRepulsion = vectorToOther.normalize()
          .multiply(-(criticalDistance - distance) * repulsionStrength);
        totalForce = totalForce.add(criticalRepulsion);
        continue; // Skip regular aggregation logic for very close particles
      }

      // Regular aggregation logic
      if (distance <= settings.aggregationDistance && 
          !particle.data.aggregatedParticles.has(otherParticle.id)) {
        // Create mutual aggregation
        particle.data.aggregatedParticles.add(otherParticle.id);
        this.initializeParticleData(otherParticle);
        otherParticle.data.aggregatedParticles.add(particle.id);
      }

      // Force calculation for all nearby particles
      if (distance <= settings.aggregationDistance || 
          particle.data.aggregatedParticles.has(otherParticle.id)) {
        let force = new paper.Point(0, 0);
        
        if (distance < minDistance) {
          // Stronger push force when too close
          const pushStrength = 0.5 * (1 - (distance / minDistance));
          force = vectorToOther.normalize().multiply(-pushStrength * (minDistance - distance));
        } else if (distance > minDistance) {
          // Weaker pull force when too far
          const pullStrength = 0.1;
          force = vectorToOther.normalize().multiply(pullStrength * (distance - minDistance));
        }

        totalForce = totalForce.add(force);
      }
    }

    // Limit maximum force to prevent erratic behavior
    const maxForce = settings.particleSize * 0.5;
    if (totalForce.length > maxForce) {
      totalForce = totalForce.normalize().multiply(maxForce);
    }

    return totalForce;
  }

  // Helper method to cleanup when particles are removed
  static cleanup(particleId: number, particles: paper.Group): void {
    (particles.children as paper.Group[]).forEach(particle => {
      if (particle.data?.aggregatedParticles) {
        particle.data.aggregatedParticles.delete(particleId);
      }
    });
  }
}