import paper from 'paper';
import { SimulationSettings } from '../../types';
import { obstacleManager } from './obstacleManager';

export class ParticleManager {
  private particles: paper.Group;
  private obstacleManager: obstacleManager;
  private _particleRadius: number = 2;
  private _trailWidth: number = 1;
  private wanderAngles: Map<number, number> = new Map();

  constructor(obstacleManager: obstacleManager) {
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

  createParticle(x: number, y: number, particleColor: string = '#000000', trailColor: string = '#8b8680'): paper.Group | null {
    const position = new paper.Point(x, y);

    // Check if the spawn position is inside any closed path
    const obstacles = this.obstacleManager.getAllClosedPaths();
    for (const obstacle of obstacles) {
      if (obstacle.contains(position)) {
        return null; // Don't spawn the particle if it's inside any closed path
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
      velocity: new paper.Point(0, 0
      ),
      createdAt: Date.now(),
      state: 'active'
    };

    this.particles.addChild(particle);
    return particle;
  }


  private spawnScatterPattern(count: number, width: number, height: number): void {
    let created = 0;
    let attempts = 0;
    const maxAttempts = count * 20; // Increase max attempts to give more chances

    while (created < count && attempts < maxAttempts) {
      // Try to find a position not inside any obstacle
      let x = Math.random() * width;
      let y = Math.random() * height;

      const particle = this.createParticle(x, y);
      if (particle) {
        created++;
      }
      attempts++;

      // If we're struggling to place particles, start trying with more spread
      if (attempts > count * 10) {
        // Add some padding to avoid edges
        const padding = 20;
        x = padding + Math.random() * (width - padding * 2);
        y = padding + Math.random() * (height - padding * 2);
      }
    }

    console.log(`Spawned ${created}/${count} particles in ${attempts} attempts`);
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

  calculateFlockingForces(
    particle: paper.Group,
    settings: SimulationSettings
  ): { separation: paper.Point; cohesion: paper.Point; alignment: paper.Point } {
    let separation = new paper.Point(0, 0);
    let cohesion = new paper.Point(0, 0);
    let alignment = new paper.Point(0, 0);
    let neighbors = 0;

    const particlePos = (particle.children[0] as paper.Path.Circle).position;
    const velocity = particle.data.velocity;
    const halfSensorAngle = (settings.sensorAngle * Math.PI / 180) / 2;

    this.particles.children.forEach(other => {
      if (particle === other || other.data.state === 'frozen') return;

      const otherPos = (other.children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);
      const distance = diff.length;

      let angleToOther = Math.atan2(diff.y, diff.x);
      let currentAngle = Math.atan2(velocity.y, velocity.x);

      let angleDiff = angleToOther - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

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

    if (neighbors > 0) {
      cohesion = cohesion.divide(neighbors).subtract(particlePos);
      alignment = alignment.divide(neighbors);
    }

    return {
      separation: separation.normalize(),
      cohesion: cohesion.normalize(),
      alignment: alignment.normalize()
    };
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

    // Reduce the angle change rate
    let wanderAngle = this.wanderAngles.get(id)!;
    wanderAngle += (Math.random() - 0.5) * settings.wanderSpeed * 0.05; // Reduced from 0.1
    this.wanderAngles.set(id, wanderAngle);

    const velocity = particle.data.velocity;
    const center = (particle.children[0] as paper.Path.Circle).position
      .add(velocity.normalize().multiply(settings.wanderRadius));

    const offset = new paper.Point(
      Math.cos(wanderAngle),
      Math.sin(wanderAngle)
    ).multiply(settings.wanderRadius);

    // Remove the 0.5 multiplier that was artificially boosting the force
    const wanderForce = center.add(offset)
      .subtract((particle.children[0] as paper.Path.Circle).position)
      .multiply(settings.wanderStrength);

    // Normalize the force to match other forces
    return wanderForce.length > 0 ? wanderForce.normalize() : wanderForce;
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

  private calculateRectangleAvoidance(position: paper.Point): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30;
    const maxForce = 1.0;

    // Get all closed paths instead of just rectangles
    const obstacles = this.obstacleManager.getAllClosedPaths();

    for (const obstacle of obstacles) {
      // Use path.getNearestPoint instead of calculating bounds
      const nearestPoint = obstacle.getNearestPoint(position);
      const diff = position.subtract(nearestPoint);
      const distance = diff.length;

      if (distance < avoidanceDistance) {
        const isInside = obstacle.contains(position);

        if (isInside) {
          avoidanceForce.set(
            avoidanceForce.x + diff.x * maxForce * 3,
            avoidanceForce.y + diff.y * maxForce * 3
          );
        } else {
          const force = Math.min(maxForce, Math.pow(avoidanceDistance - distance, 2) / (avoidanceDistance * avoidanceDistance));
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

    // Check if particle is already stopped
    if (particle.data.state === 'stopped') {
      return;
    }

    // Update state based on age and paint mode
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'active' && age >= settings.activeStateDuration) {
        particle.data.state = 'frozen';
      }
    } else {
      particle.data.state = 'active';
      trail.visible = false;
    }

    // Only update active particles
    if (particle.data.state === 'active') {
      let finalForce = new paper.Point(0, 0);
      let totalWeight = 0;

      // Calculate forces only if not in bounce cooldown
      const bounceComplete = !particle.data.bounceCooldown ||
        Date.now() > particle.data.bounceCooldown;

      if (bounceComplete) {
        // Flocking forces
        if (settings.flockingEnabled) {
          const flockingForces = this.calculateFlockingForces(particle, settings);

          // Apply individual flocking force weights
          const separationForce = flockingForces.separation.multiply(settings.separation);
          const cohesionForce = flockingForces.cohesion.multiply(settings.cohesion);
          const alignmentForce = flockingForces.alignment.multiply(settings.alignment);

          if (separationForce.length > 0) {
            finalForce = finalForce.add(separationForce);
            totalWeight += settings.separation;
          }
          if (cohesionForce.length > 0) {
            finalForce = finalForce.add(cohesionForce);
            totalWeight += settings.cohesion;
          }
          if (alignmentForce.length > 0) {
            finalForce = finalForce.add(alignmentForce);
            totalWeight += settings.alignment;
          }
        }

        // Wander force
        if (settings.wanderEnabled && settings.wanderStrength > 0) {
          const wanderForce = this.calculateWanderForce(particle, settings);
          if (wanderForce.length > 0) {
            finalForce = finalForce.add(wanderForce.multiply(settings.wanderStrength));
            totalWeight += settings.wanderStrength;
          }
        }
      }

      // External force (always applied regardless of bounce cooldown)
      if (settings.externalForceStrength > 0) {
        const externalForce = this.calculateExternalForce(settings);
        if (externalForce.length > 0) {
          finalForce = finalForce.add(externalForce.multiply(settings.externalForceStrength));
          totalWeight += settings.externalForceStrength;
        }
      }

      // Calculate weighted average if there are any forces
      if (totalWeight > 0) {
        finalForce = finalForce.divide(totalWeight);
      }

      // Apply speed scaling after weighted average
      finalForce = finalForce.multiply(settings.speed);

      // Add avoidance force separately (as it's a reactive force)
      const avoidanceForce = this.calculateRectangleAvoidance(point.position);
      finalForce = finalForce.add(avoidanceForce);

      // Apply forces to velocity
      velocity = velocity.add(finalForce);

      // Limit maximum velocity based on speed setting
      const maxVelocity = settings.speed * 1;
      if (velocity.length > maxVelocity) {
        velocity = velocity.normalize().multiply(maxVelocity);
      }

      // Update position and handle boundaries
      const newPosition = point.position.add(velocity);

      // Apply boundary behavior
      switch (settings.boundaryBehavior) {
        case 'wrap-around':
          newPosition.x = ((newPosition.x + width) % width);
          newPosition.y = ((newPosition.y + height) % height);
          break;

        case 'reflect':
          if (newPosition.x < 0 || newPosition.x > width) {
            velocity.x *= -1;
            newPosition.x = newPosition.x < 0 ? 0 : width;
          }
          if (newPosition.y < 0 || newPosition.y > height) {
            velocity.y *= -1;
            newPosition.y = newPosition.y < 0 ? 0 : height;
          }
          break;

        case 'stop':
          if (newPosition.x < 0 || newPosition.x > width ||
            newPosition.y < 0 || newPosition.y > height) {
            velocity.set(0, 0);
            newPosition.x = Math.max(0, Math.min(width, newPosition.x));
            newPosition.y = Math.max(0, Math.min(height, newPosition.y));
            particle.data.state = 'stopped';
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

      // Update trail if in paint mode
      if (settings.paintingModeEnabled && particle.data.state === 'active') {
        trail.visible = true;
        trail.add(newPosition);
        trail.smooth();
      }

      // Store velocity for next frame
      particle.data.velocity = velocity;
    }

    // Update opacity based on state
    point.opacity = settings.paintingModeEnabled && particle.data.state === 'frozen' ? 1 : 1;
  }

  clear(): void {
    this.particles.removeChildren();
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
