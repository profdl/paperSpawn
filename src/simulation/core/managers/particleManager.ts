import paper from 'paper';
import { SimulationSettings } from '../../../types';
import { ObstacleManager } from './obstacleManager';
import { ParticleCreator } from '../ParticleCreator';
import { ParticleUpdater } from '../ParticleUpdater';

export class ParticleManager {
  private particles: paper.Group;
  private obstacleManager: ObstacleManager;
  private _particleRadius: number = 2;
  private _trailWidth: number = 1;

  constructor(obstacleManager: ObstacleManager) {
    this.particles = new paper.Group();
    this.obstacleManager = obstacleManager;
  }

  get particleRadius(): number {
    return this._particleRadius;
  }

  get trailWidth(): number {
    return this._trailWidth;
  }



  setColors(particleColor: string, trailColor: string): void {
    this.particles.children.forEach(particle => {
      const point = particle.children[0] as paper.Path.Circle;
      const trail = particle.children[1] as paper.Path;

      point.fillColor = new paper.Color(particleColor);
      trail.strokeColor = new paper.Color(trailColor);
    });
  }

  setParticleRadius(radius: number): void {
    this._particleRadius = radius;
  }

  setTrailWidth(width: number): void {
    this._trailWidth = width;
    this.particles.children.forEach(particle => {
      const trail = particle.children[1] as paper.Path;
      trail.strokeWidth = width;
    });
  }

  getParticles(): paper.Group {
    return this.particles;
  }

  clear(): void {
    this.particles.removeChildren();
  }


  createParticle(
    x: number, 
    y: number, 
    particleColor:  '#000000', 
    trailColor:  '#000000',
    isSeed: boolean = false  // Add isSeed parameter
  ): paper.Group | null {
    const particle = ParticleCreator.create(
      x,
      y,
      particleColor,
      trailColor,
      this.particleRadius,
      this.trailWidth,
      this.obstacleManager,
      isSeed  // Pass isSeed to ParticleCreator
    );
  
    if (particle) {
      this.particles.addChild(particle);
    }
  
    return particle;
  }

  updateParticles(
    settings: SimulationSettings,
    width: number,
    height: number
  ): void {
    this.particles.children.forEach(particle => {
      ParticleUpdater.update(
        particle as paper.Group,
        this.particles,
        settings,
        width,
        height,
        this.obstacleManager
      );
    });
  }



  removeParticlesInRadius(center: paper.Point, radius: number): void {
    const particlesToRemove: paper.Group[] = [];
    this.particles.children.forEach(particle => {
      const point = particle.children[0] as paper.Path.Circle;
      const distance = point.position.subtract(center).length;
      if (distance <= radius) {
        particlesToRemove.push(particle as paper.Group);
      }
    });

    particlesToRemove.forEach(particle => particle.remove());
  }
}