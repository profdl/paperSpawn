import paper from 'paper';
import { SimulationSettings } from '../../../types';

export class DLAggregateForce {
  // Add a method to check and maintain seed count
  static ensureSeeds(particles: paper.Group, settings: SimulationSettings): void {
    if (!settings.aggregationEnabled || !settings.isDLA) return;

    const particleArray = particles.children as paper.Group[];
    
    // Count current seeds
    let currentSeedCount = 0;
    particleArray.forEach(particle => {
      if (particle.data?.aggregationState?.isSeed) {
        currentSeedCount++;
      }
    });

    // If we need more seeds, create them
    if (currentSeedCount < settings.aggregationSeedCount) {
      const needSeeds = settings.aggregationSeedCount - currentSeedCount;
      this.initializeRandomSeeds(particles, needSeeds);
    }
  }

  static calculate(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.aggregationEnabled || !settings.isDLA) {
      return new paper.Point(0, 0);
    }

    // Initialize particle state if needed
    if (!particle.data.aggregationState) {
      particle.data.aggregationState = {
        isStuck: false,
        isSeed: false,
        stickingProbability: Math.random(),
        aggregatedWith: new Set<number>()
      };
    }

    // Ensure we have enough seeds
    this.ensureSeeds(particles, settings);

    const point = particle.children[1] as paper.Path.Circle;
    
    // If particle is already stuck, keep it frozen but return zero force
    if (particle.data.aggregationState.isStuck) {
      particle.data.state = 'frozen';
      return new paper.Point(0, 0);
    }

    // Initialize seed particles if they haven't been set
    if (!particles.data?.hasSeeds) {
      this.initializeRandomSeeds(particles, settings.aggregationSeedCount);
      particles.data.hasSeeds = true;
    }

    // Look for nearby stuck particles
    for (const otherParticle of particles.children as paper.Group[]) {
      if (particle === otherParticle) continue;
      
      const otherPoint = otherParticle.children[1] as paper.Path.Circle;
      const distance = point.position.getDistance(otherPoint.position);

      // Check if the other particle is stuck and we're within aggregation distance
      if (distance <= settings.aggregationDistance && 
          (otherParticle.data.aggregationState?.isStuck || 
           otherParticle.data.aggregationState?.isSeed)) {
        
        // Apply sticking probability
        if (Math.random() < particle.data.aggregationState.stickingProbability) {
          // Stick this particle
          particle.data.aggregationState.isStuck = true;
          particle.data.aggregationState.aggregatedWith.add(otherParticle.id);
          
          // Freeze the particle
          particle.data.state = 'frozen';
          
          // Draw connection line
          if (settings.aggregationLineColor) {
            const line = new paper.Path.Line({
              from: point.position,
              to: otherPoint.position,
              strokeColor: settings.aggregationLineColor,
              strokeWidth: 1,
              opacity: 0.5
            });
            if (!particle.data.aggregationLines) {
              particle.data.aggregationLines = [];
            }
            particle.data.aggregationLines.push(line);
          }
        }
      }
    }

    return new paper.Point(0, 0);
  }


  private static initializeRandomSeeds(particles: paper.Group, seedCount: number): void {
    const particleArray = particles.children as paper.Group[];
    
    // Get array of non-seed particles
    const availableParticles = particleArray.filter(particle => 
      !particle.data?.aggregationState?.isSeed && 
      !particle.data?.aggregationState?.isStuck
    );
    
    // Create array of indices and shuffle it
    const indices = Array.from({ length: availableParticles.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Select the first n indices as seeds
    for (let i = 0; i < Math.min(seedCount, indices.length); i++) {
      const particle = availableParticles[indices[i]];
      if (particle) {
        particle.data.aggregationState = {
          isStuck: true,
          isSeed: true,
          stickingProbability: 1,
          aggregatedWith: new Set<number>()
        };
        particle.data.state = 'frozen';
      }
    }
  }

  static cleanup(particleId: number, particles: paper.Group): void {
    (particles.children as paper.Group[]).forEach(particle => {
      if (particle.data?.aggregationLines) {
        particle.data.aggregationLines.forEach((line: paper.Path) => line.remove());
      }
      if (particle.data?.aggregationState?.aggregatedWith) {
        particle.data.aggregationState.aggregatedWith.delete(particleId);
      }
    });

    // Check and maintain seed count after cleanup
    this.ensureSeeds(particles, particles.data.settings);
  }

  // Add method to reset all particle states
  static resetParticleStates(particles: paper.Group): void {
    particles.data.hasSeeds = false;
    (particles.children as paper.Group[]).forEach(particle => {
      if (particle.data?.aggregationLines) {
        particle.data.aggregationLines.forEach((line: paper.Path) => line.remove());
      }
      particle.data.aggregationState = null;
    });
  }
}