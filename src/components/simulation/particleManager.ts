import paper from 'paper';
import { SimulationSettings } from '../../types';
import { RectangleManager } from './rectangleManager';

export class ParticleManager {
  private particles: paper.Group;
  private rectangleManager: RectangleManager;
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
    createParticle(x: number, y: number, particleColor: string = '#000000', trailColor: string = '#8b8680'): paper.Group | null {
      const position = new paper.Point(x, y);
      
      // Check if the spawn position is inside any rectangle
      const rectangles = this.rectangleManager.getAllRectangles();
      for (const rectangle of rectangles) {
        if (rectangle.bounds.contains(position)) {
          return null; // Don't spawn the particle if it's inside a rectangle
        }
      }
  
      const particle = new paper.Group();
      
      const point = new paper.Path.Circle({
        center: position,
        radius: this._particleRadius,
        fillColor: particleColor
      });
    
      const trail = new paper.Path({
        strokeColor: trailColor,
        strokeWidth: this._trailWidth,
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

  spawnParticles(count: number, pattern: string, width: number, height: number): void {
    this.clear();

    switch (pattern) {
      case 'scatter':
        this.spawnScatterPattern(count, width, height);
        break;
      case 'grid':
        this.spawnGridPattern(count, width, height);
        break;
      case 'circle':
        this.spawnCirclePattern(count, width, height);
        break;
      case 'point':
        this.spawnPointPattern(count, width, height);
        break;
    }
  }

  private spawnScatterPattern(count: number, width: number, height: number): void {
    let attempts = 0;
    let created = 0;
    const maxAttempts = count * 3; // Limit attempts to prevent infinite loops

    while (created < count && attempts < maxAttempts) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const particle = this.createParticle(x, y);
      if (particle) created++;
      attempts++;
    }
  }

  private spawnGridPattern(count: number, width: number, height: number): void {
    const cols = Math.ceil(Math.sqrt(count * width / height));
    const rows = Math.ceil(count / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    let created = 0;
    for (let row = 0; row < rows && created < count; row++) {
      for (let col = 0; col < cols && created < count; col++) {
        const x = (col + 0.5) * cellWidth;
        const y = (row + 0.5) * cellHeight;
        const particle = this.createParticle(x, y);
        if (particle) created++;
      }
    }
  }

  private spawnCirclePattern(count: number, width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    let created = 0;
    let attempts = 0;
    const maxAttempts = count * 3;

    while (created < count && attempts < maxAttempts) {
      const angle = (attempts / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const particle = this.createParticle(x, y);
      if (particle) created++;
      attempts++;
    }
  }

  private spawnPointPattern(count: number, width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const spread = 5;
    let created = 0;
    let attempts = 0;
    const maxAttempts = count * 3;

    while (created < count && attempts < maxAttempts) {
      const x = centerX + (Math.random() - 0.5) * spread;
      const y = centerY + (Math.random() - 0.5) * spread;
      const particle = this.createParticle(x, y);
      if (particle) created++;
      attempts++;
    }
  }

// in particleManager.ts
calculateFlockingForces(
  particle: paper.Group,
  settings: SimulationSettings
): paper.Point {
  let separation = new paper.Point(0, 0);
  let cohesion = new paper.Point(0, 0);
  let alignment = new paper.Point(0, 0);
  let neighbors = 0;

  const particlePos = (particle.children[0] as paper.Path.Circle).position;
  const velocity = particle.data.velocity;
  // Convert sensor angle from degrees to radians and halve it (as it's the total angle divided by 2)
  const halfSensorAngle = (settings.sensorAngle * Math.PI / 180) / 2;

  this.particles.children.forEach(other => {
    if (particle === other || other.data.state === 'frozen') return;

    const otherPos = (other.children[0] as paper.Path.Circle).position;
    const diff = otherPos.subtract(particlePos);
    const distance = diff.length;

    // Calculate angle between velocity and direction to other particle
    let angleToOther = Math.atan2(diff.y, diff.x);
    let currentAngle = Math.atan2(velocity.y, velocity.x);
    
    // Normalize angle difference to [-PI, PI]
    let angleDiff = angleToOther - currentAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // Only consider particles within the sensor angle
    if (Math.abs(angleDiff) <= halfSensorAngle) {
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
      .multiply(settings.wanderStrength * 0.5);
  }

  calculateExternalForce(settings: SimulationSettings): paper.Point {
    // Use angle directly in degrees - Paper.js handles the conversion internally
    const angle = settings.externalForceAngle || 0;
    const strength = settings.externalForceStrength || 0;
    
    // Create a vector using degrees - Paper.js Point constructor accepts degrees by default
    return new paper.Point({
      length: strength * 10, // Scale the strength to make it more noticeable
      angle: angle
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

    // Update state based on age and paint mode
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'active' && age >= settings.activeStateDuration) {
        particle.data.state = 'frozen';
      }
    } else {
      // If paint mode is disabled, always stay active but don't show trail
      particle.data.state = 'active';
      trail.visible = false;
    }

    if (!settings.paintingModeEnabled || particle.data.state !== 'frozen') {
      let force = new paper.Point(0, 0);

      // Only apply flocking/wandering if not in bounce cooldown
    const bounceComplete = !particle.data.bounceCooldown || 
    Date.now() > particle.data.bounceCooldown;

// Calculate desired force from behaviors
if (bounceComplete) {
if (settings.flockingEnabled) {
force = force.add(this.calculateFlockingForces(particle, settings));
}

if (settings.wanderEnabled) {
force = force.add(this.calculateWanderForce(particle, settings));
}
}
      
      // Calculate desired force from behaviors
      if (settings.flockingEnabled) {
        force = force.add(this.calculateFlockingForces(particle, settings));
      }
  
      if (settings.wanderEnabled) {
        force = force.add(this.calculateWanderForce(particle, settings));
      }
  
      if (settings.externalForceStrength && settings.externalForceStrength !== 0) {
        force = force.add(this.calculateExternalForce(settings));
      }
  
      // Normalize the behavioral forces but scale based on speed setting
      if (force.length > 0) {
        force = force.normalize().multiply(settings.speed * 1);
      }

      // Add avoidance force after normalizing the behavioral forces
      const avoidanceForce = this.calculateRectangleAvoidance(point.position);
      force = force.add(avoidanceForce);

      // Apply forces to velocity
      velocity = velocity.add(force);

      // Scale maximum velocity based on speed setting
      const maxVelocity = settings.speed * 1;
      if (velocity.length > maxVelocity) {
        velocity = velocity.normalize().multiply(maxVelocity);
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
            if (newPosition.x < 0 || newPosition.x > width ||
                newPosition.y < 0 || newPosition.y > height) {
              const id = particle.id;
              if (this.wanderAngles.has(id)) {
                const currentAngle = this.wanderAngles.get(id)!;
                
                // Determine which boundary was hit and invert the angle accordingly
                if (newPosition.x < 0 || newPosition.x > width) {
                  // For vertical boundaries (left/right), reflect across vertical axis
                  // This is done by inverting around π (180 degrees)
                  this.wanderAngles.set(id, Math.PI - currentAngle);
                } else {
                  // For horizontal boundaries (top/bottom), reflect across horizontal axis
                  // This is done by negating the angle
                  this.wanderAngles.set(id, -currentAngle);
                }
              }
              
              // Reflect velocity based on which boundary was hit
              if (newPosition.x < 0 || newPosition.x > width) {
                velocity.x *= -1; // Reflect x component
              } else {
                velocity.y *= -1; // Reflect y component
              }
              
              // Move particle back into bounds
              newPosition.x = Math.max(this._particleRadius, Math.min(width - this._particleRadius, newPosition.x));
              newPosition.y = Math.max(this._particleRadius, Math.min(height - this._particleRadius, newPosition.y));
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

      // Add to trail only if in paint mode and active
      if (settings.paintingModeEnabled && particle.data.state === 'active') {
        trail.visible = true;
        trail.add(newPosition);
        trail.smooth();
      }

      // Store velocity for next frame
      particle.data.velocity = velocity;
    }

    // Update opacity
    if (settings.paintingModeEnabled) {
      point.opacity = particle.data.state === 'frozen' ? 1 : 1;
    } else {
      point.opacity = 1;
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
