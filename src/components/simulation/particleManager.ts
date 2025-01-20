import paper from 'paper';
import { SimulationSettings } from '../../types';
import { RectangleManager } from './rectangleManager';

export class ParticleManager {
  private particles: paper.Group;
  private rectangleManager: RectangleManager;
  // Change from private readonly to private
  private _particleRadius: number = 2;
  private _trailWidth: number = 1;
  private wanderAngles: Map<number, number> = new Map();

  

  constructor(rectangleManager: RectangleManager) {
    this.particles = new paper.Group();
    this.rectangleManager = rectangleManager;
  }

  // Add new method for rectangle avoidance
  private calculateRectangleAvoidance(position: paper.Point): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30;
    const maxForce = 1.0;

    const rectangles = this.rectangleManager.getAllRectangles();
    
    for (const rectangle of rectangles) {
      const bounds = rectangle.bounds;
      const nearestX = Math.max(bounds.left, Math.min(position.x, bounds.right));
      const nearestY = Math.max(bounds.top, Math.min(position.y, bounds.bottom));
      const nearest = new paper.Point(nearestX, nearestY);

      const diff = position.subtract(nearest);
      const distance = diff.length;

      if (distance < avoidanceDistance) {
        const force = Math.min(maxForce, Math.pow(avoidanceDistance - distance, 2) / (avoidanceDistance * avoidanceDistance));
        
        if (bounds.contains(position)) {
          avoidanceForce.set(
            avoidanceForce.x + diff.x * maxForce * 3,
            avoidanceForce.y + diff.y * maxForce * 3
          );
        } else {
          const normalizedForce = diff.normalize().multiply(force);
          avoidanceForce.set(
            avoidanceForce.x + normalizedForce.x,
            avoidanceForce.y + normalizedForce.y
          );
        }
      }
    }

    if (avoidanceForce.length > maxForce) {
      avoidanceForce.length = maxForce;
    }

    return avoidanceForce;
  }

    // Add getters and setters for the properties
    get particleRadius(): number {
      return this._particleRadius;
    }
  
    get trailWidth(): number {
      return this._trailWidth;
    }
  
    // Update methods to use the new property names
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
    createParticle(x: number, y: number, particleColor: string = '#000000', trailColor: string = '#8b8680'): paper.Group {
      const particle = new paper.Group();
      
      const point = new paper.Path.Circle({
        center: new paper.Point(x, y),
        radius: this._particleRadius,  // Updated here
        fillColor: particleColor
      });
  
      const trail = new paper.Path({
        strokeColor: trailColor,
        strokeWidth: this._trailWidth,  // Updated here
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

   calculateFlockingForces(
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

   calculateWanderForce(
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

   calculateExternalForce(settings: SimulationSettings): paper.Point {
    // Convert angle from degrees to radians
    const angleInRadians = (settings.externalForceAngle || 0) * Math.PI / 180;
    const strength = settings.externalForceStrength || 0;
    
    // Create a vector from angle and strength
    return new paper.Point({
      length: strength * 0.1, // Scale down the strength to not overwhelm other forces
      angle: angleInRadians
    });
  }

  updateParticles(
    settings: SimulationSettings, 
    width: number, 
    height: number
  ): void {
    this.particles.children.forEach(particle => {
      this.updateParticle(particle as paper.Group, settings, width, height);
    });
  }


  private updateParticle(
    particle: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number
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

      // Normalize and scale the behavioral forces first
      if (force.length > 0) {
        force = force.normalize().multiply(2);
      }

      // Apply speed setting and state-based modifications
      const speedMultiplier = settings.speed * (
        particle.data.state === 'freezing' 
          ? 1 - ((age - settings.activeStateDuration) / settings.freezingDuration)
          : 1
      );

      force = force.multiply(speedMultiplier);

      // Add avoidance force after normalizing the behavioral forces
      const avoidanceForce = this.calculateRectangleAvoidance(point.position);
      force = force.add(avoidanceForce);

      // Apply forces to velocity
      velocity = velocity.add(force);

      // Normalize final velocity if needed
      if (velocity.length > 2) {
        velocity = velocity.normalize().multiply(2);
      }

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
