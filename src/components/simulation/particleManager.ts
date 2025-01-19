import paper from 'paper';
import { SimulationSettings } from '../../types';

export class ParticleManager {
  private particles: paper.Group;
  private particleRadius: number = 2;
  private trailWidth: number = 1;
  private wanderAngles: Map<number, number> = new Map();

  constructor() {
    this.particles = new paper.Group();
  }

  createParticle(x: number, y: number, particleColor: string = '#000000', trailColor: string = '#8b8680'): paper.Group {
    const particle = new paper.Group();
    
    const point = new paper.Path.Circle({
      center: new paper.Point(x, y),
      radius: this.particleRadius,
      fillColor: particleColor
    });

    const trail = new paper.Path({
      strokeColor: trailColor,
      strokeWidth: this.trailWidth,
      strokeCap: 'round',
      opacity: 1
    });
    trail.add(new paper.Point(x, y));

    particle.addChildren([point, trail]);
    particle.data = {
      velocity: new paper.Point(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      createdAt: Date.now(),
      state: 'active'
    };

    this.particles.addChild(particle);
    return particle;
  }

  private calculateFlockingForces(
    particle: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    let separation = new paper.Point(0, 0);
    let cohesion = new paper.Point(0, 0);
    let alignment = new paper.Point(0, 0);
    let neighbors = 0;

    const particlePos = (particle.children[0] as paper.Path.Circle).position;

    this.particles.children.forEach(other => {
      if (particle === other || other.data.state === 'frozen') return;

      const otherPos = (other.children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);
      const distance = diff.length;

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
    });

    let force = new paper.Point(0, 0);

    if (neighbors > 0) {
      cohesion = cohesion.divide(neighbors).subtract(particlePos);
      alignment = alignment.divide(neighbors);
      
      force = force.add(separation.multiply(settings.separation))
                   .add(cohesion.multiply(settings.cohesion))
                   .add(alignment.multiply(settings.alignment));
    }

    return force;
  }

  private calculateWanderForce(
    particle: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.wanderEnabled) return new paper.Point(0, 0);

    const id = particle.id;
    if (!this.wanderAngles.has(id)) {
      this.wanderAngles.set(id, Math.random() * Math.PI * 2);
    }

    let wanderAngle = this.wanderAngles.get(id)!;
    wanderAngle += (Math.random() - 0.5) * settings.wanderSpeed * 0.1;
    this.wanderAngles.set(id, wanderAngle);

    const velocity = particle.data.velocity;
    const center = (particle.children[0] as paper.Path.Circle).position
      .add(velocity.normalize().multiply(settings.wanderRadius));

    const offset = new paper.Point(
      Math.cos(wanderAngle),
      Math.sin(wanderAngle)
    ).multiply(settings.wanderRadius);

    return center.add(offset)
      .subtract((particle.children[0] as paper.Path.Circle).position)
      .multiply(settings.wanderStrength);
  }

  updateParticles(
    settings: SimulationSettings, 
    width: number, 
    height: number, 
    getRectangleAvoidance: (position: paper.Point) => paper.Point
  ): void {
    this.particles.children.forEach(particle => {
      this.updateParticle(particle as paper.Group, settings, width, height, getRectangleAvoidance);
    });
  }

  private updateParticle(
    particle: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number,
    getRectangleAvoidance: (position: paper.Point) => paper.Point
  ): void {
    const point = particle.children[0] as paper.Path.Circle;
    const trail = particle.children[1] as paper.Path;
    const age = Date.now() - particle.data.createdAt;
    let velocity = particle.data.velocity;

    // Update state based on age
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'active' && age >= settings.activeStateDuration) {
        particle.data.state = 'freezing';
      } else if (particle.data.state === 'freezing' && 
                 age >= settings.activeStateDuration + settings.freezingDuration) {
        particle.data.state = 'frozen';
      }
    }

    if (!settings.paintingModeEnabled || particle.data.state !== 'frozen') {
      // Calculate forces
      let force = new paper.Point(0, 0);

      if (settings.flockingEnabled) {
        force = force.add(this.calculateFlockingForces(particle, settings));
      }

      if (settings.wanderEnabled) {
        force = force.add(this.calculateWanderForce(particle, settings));
      }
      
      // Add rectangle avoidance force
      force = force.add(getRectangleAvoidance(point.position));

      // Apply forces to velocity
      velocity = velocity.add(force);

      // Normalize velocity
      if (velocity.length > 0) {
        velocity = velocity.normalize().multiply(2);
      }

      // Apply speed setting and state-based modifications
      const speedMultiplier = settings.speed * (
        particle.data.state === 'freezing' 
          ? 1 - ((age - settings.activeStateDuration) / settings.freezingDuration)
          : 1
      );

      velocity = velocity.multiply(speedMultiplier);

      // Update position
      const newPosition = point.position.add(velocity);

      // Apply boundary behavior
      switch (settings.boundaryBehavior) {
        case 'wrap-around':
          newPosition.x = ((newPosition.x + width) % width);
          newPosition.y = ((newPosition.y + height) % height);
          break;
          
        case 'bounce':
          if (newPosition.x < 0 || newPosition.x > width) {
            velocity.x *= -1;
            newPosition.x = Math.max(0, Math.min(width, newPosition.x));
          }
          if (newPosition.y < 0 || newPosition.y > height) {
            velocity.y *= -1;
            newPosition.y = Math.max(0, Math.min(height, newPosition.y));
          }
          break;
          
        case 'stop':
          if (newPosition.x < 0 || newPosition.x > width ||
              newPosition.y < 0 || newPosition.y > height) {
            velocity.set(0, 0);
            newPosition.x = Math.max(0, Math.min(width, newPosition.x));
            newPosition.y = Math.max(0, Math.min(height, newPosition.y));
          }
          break;
          
        case 'travel-off':
          if (newPosition.x < 0 || newPosition.x > width ||
              newPosition.y < 0 || newPosition.y > height) {
            particle.remove();
            return;
          }
          break;
      }

      // Update point position
      point.position = newPosition;

      // Add to trail during active and freezing states
      if (particle.data.state === 'active' || particle.data.state === 'freezing') {
        trail.add(newPosition);
        trail.smooth();
      }

      // Store velocity for next frame
      particle.data.velocity = velocity;
    }

    // Update opacity
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'frozen') {
        point.opacity = settings.trailPersistence;
      } else if (particle.data.state === 'freezing') {
        const freezingProgress = (age - settings.activeStateDuration) / settings.freezingDuration;
        const opacity = 1 - (1 - settings.trailPersistence) * freezingProgress;
        point.opacity = opacity;
      }
    }
  }

  clear(): void {
    this.particles.removeChildren();
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
    this.particleRadius = radius;
  }

  setTrailWidth(width: number): void {
    this.trailWidth = width;
    this.particles.children.forEach(particle => {
      const trail = particle.children[1] as paper.Path;
      trail.strokeWidth = width;
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
