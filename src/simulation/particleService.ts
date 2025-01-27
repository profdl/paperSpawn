import paper from 'paper';
import { SimulationSettings } from '../types';
import { ObstacleManager } from './managers/obstacleManager';

export class ParticleService {
  private particles: paper.Group;
  private particleRadius: number = 2;
  private trailWidth: number = 1;
  private particleColor: string = '#000000';
  private trailColor: string = '#8b8680';
  private obstacleManager: ObstacleManager;

  constructor(obstacleManager: ObstacleManager) {
    this.particles = new paper.Group();
    this.obstacleManager = obstacleManager;
  }

  createParticle(
    x: number,
    y: number,
    particleColor?: string,
    trailColor?: string,
    isSeed: boolean = false
  ): paper.Group {
    const position = new paper.Point(x, y);
    
    // Create trail
    const trail = new paper.Path({
      strokeColor: trailColor || this.trailColor,
      strokeWidth: this.trailWidth,
      strokeCap: 'round',
      visible: false
    });
    trail.add(position);

    // Create particle point
    const point = new paper.Path.Circle({
      center: position,
      radius: this.particleRadius,
      fillColor: particleColor || this.particleColor
    });

    // Group trail and point
    const particle = new paper.Group([trail, point]);
    
    // Add particle data
    particle.data = {
      velocity: new paper.Point(0, 0),
      createdAt: Date.now(),
      state: 'active',
      aggregatedParticles: new Set<number>(),
      isSeed: isSeed
    };

    // Add to particles group
    this.particles.addChild(particle);

    return particle;
  }

  removeParticlesInRadius(position: paper.Point, radius: number): void {
    const particlesToRemove: paper.Group[] = [];
    
    (this.particles.children as paper.Group[]).forEach((particle: paper.Group) => {
      const particlePoint = particle.children[1] as paper.Path.Circle;
      if (particlePoint.position.getDistance(position) < radius) {
        particlesToRemove.push(particle);
      }
    });

    particlesToRemove.forEach(particle => {
      if (particle.data?.aggregationLines) {
        particle.data.aggregationLines.forEach((line: paper.Path) => {
          if (line && line.remove) {
            line.remove();
          }
        });
      }
      particle.remove();
    });
  }

  clear(): void {
    this.particles.removeChildren();
  }

  getParticles(): paper.Group {
    return this.particles;
  }

  setColors(particleColor: string, trailColor: string): void {
    this.particleColor = particleColor;
    this.trailColor = trailColor;
    
    (this.particles.children as paper.Group[]).forEach((particle: paper.Group) => {
      const point = particle.children[1] as paper.Path.Circle;
      const trail = particle.children[0] as paper.Path;
      
      point.fillColor = new paper.Color(particleColor);
      trail.strokeColor = new paper.Color(trailColor);
    });
  }

  
  setParticleRadius(radius: number): void {
    this.particleRadius = radius;
    (this.particles.children as paper.Group[]).forEach((particle: paper.Group) => {
      const point = particle.children[1] as paper.Path.Circle;
      point.scale(radius / point.bounds.width * 2);
    });
  }

  setTrailWidth(width: number): void {
    this.trailWidth = width;
    (this.particles.children as paper.Group[]).forEach((particle: paper.Group) => {
      const trail = particle.children[0] as paper.Path;
      trail.strokeWidth = width;
    });
  }

  updateParticles(settings: SimulationSettings, width: number, height: number): void {
    (this.particles.children as paper.Group[]).forEach((particle: paper.Group) => {
      import('./core/ParticleUpdater').then(({ ParticleUpdater }) => {
        ParticleUpdater.update(
          particle,
          this.particles,
          settings,
          width,
          height,
          this.obstacleManager
        );
      });
    });
  }
}
