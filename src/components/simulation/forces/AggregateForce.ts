import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class AggregationForce {
  private static initializeParticleData(particle: paper.Group): void {
    if (!particle.data) {
      particle.data = {};
    }
    
    if (particle.data.leaderId === undefined) {
      particle.data.leaderId = null;
    }
  }

  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.aggregationEnabled) return new paper.Point(0, 0);

    this.initializeParticleData(particle);
    
    // If particle is already following a leader, move towards leader
    if (particle.data.leaderId !== null) {
      const leader = (particles.children as paper.Group[]).find(p => p.id === particle.data.leaderId);
      if (leader) {
        const leaderPos = (leader.children[1] as paper.Path.Circle).position;
        const currentPos = (particle.children[1] as paper.Path.Circle).position;
        return leaderPos.subtract(currentPos).multiply(0.1);
      } else {
        // Leader no longer exists, reset leadership
        particle.data.leaderId = null;
      }
    }

    // Only look for particles to aggregate with if not already following
    if (particle.data.leaderId === null) {
      for (const otherParticle of particles.children as paper.Group[]) {
        if (particle === otherParticle) continue;
        
        this.initializeParticleData(otherParticle);
        
        const point = particle.children[1] as paper.Path.Circle;
        const otherPoint = otherParticle.children[1] as paper.Path.Circle;
        const distance = point.position.getDistance(otherPoint.position);

        if (distance <= settings.aggregationDistance) {
          // Simple rule: particle with higher ID becomes leader
          if (otherParticle.id > particle.id) {
            particle.data.leaderId = otherParticle.id;
            break; // Stop looking once we find a leader
          }
        }
      }
    }

    return new paper.Point(0, 0);
  }

  // Helper method to cleanup when particles are removed
  static cleanup(particleId: number, particles: paper.Group): void {
    (particles.children as paper.Group[]).forEach(particle => {
      if (particle.data?.leaderId === particleId) {
        particle.data.leaderId = null;
      }
    });
  }
}