import { ParticleType, SimulationSettings } from '../types/particle';

export class ParticlePhysics {
  static calculateFlockingForces(
    particle: ParticleType,
    particles: ParticleType[],
    settings: SimulationSettings
  ): { vx: number; vy: number } {
    let separationX = 0, separationY = 0, cohesionX = 0, cohesionY = 0, alignmentX = 0, alignmentY = 0;
    let neighbors = 0;

    particles.forEach(other => {
      if (particle === other || other.state === 'frozen') return;

      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < settings.separationDistance) {
        const force = (settings.separationDistance - dist) / settings.separationDistance;
        separationX -= dx * force;
        separationY -= dy * force;
      }

      if (dist < settings.cohesionDistance) {
        cohesionX += other.x;
        cohesionY += other.y;
        neighbors++;
      }

      if (dist < settings.alignmentDistance) {
        alignmentX += other.vx;
        alignmentY += other.vy;
      }
    });

    // Calculate desired velocities for each behavior
    let vx = particle.vx;
    let vy = particle.vy;

    if (neighbors > 0) {
      // Calculate cohesion force
      const centerX = cohesionX / neighbors;
      const centerY = cohesionY / neighbors;
      const cohesionAngle = Math.atan2(centerY - particle.y, centerX - particle.x);
      const currentAngle = Math.atan2(vy, vx);
      
      // Apply turn rate limitation to cohesion
      const cohesionDiff = this.limitAngleChange(
        currentAngle,
        cohesionAngle,
        settings.turnRate * Math.PI
      );
      
      // Calculate alignment force
      const alignmentAngle = Math.atan2(alignmentY / neighbors, alignmentX / neighbors);
      const alignmentDiff = this.limitAngleChange(
        currentAngle,
        alignmentAngle,
        settings.turnRate * Math.PI
      );

      // Apply forces with turn rate limitation
      vx += Math.cos(cohesionDiff) * settings.cohesion * 0.1;
      vy += Math.sin(cohesionDiff) * settings.cohesion * 0.1;
      vx += Math.cos(alignmentDiff) * settings.alignment * 0.1;
      vy += Math.sin(alignmentDiff) * settings.alignment * 0.1;
    }

    // Apply separation force
    if (Math.abs(separationX) > 0 || Math.abs(separationY) > 0) {
      const separationAngle = Math.atan2(separationY, separationX);
      const currentAngle = Math.atan2(vy, vx);
      const separationDiff = this.limitAngleChange(
        currentAngle,
        separationAngle,
        settings.turnRate * Math.PI
      );
      
      vx += Math.cos(separationDiff) * settings.separation * 0.1;
      vy += Math.sin(separationDiff) * settings.separation * 0.1;
    }

    // Apply external forces
    if (settings.externalForceStrength > 0) {
      const angleRad = (settings.externalForceAngle * Math.PI) / 180;
      vx += Math.cos(angleRad) * settings.externalForceStrength;
      vy += Math.sin(angleRad) * settings.externalForceStrength;
    }

    return { vx, vy };
  }

  static calculateSlimeBehavior(
    particle: ParticleType,
    particles: ParticleType[],
    settings: SimulationSettings
  ): { angle: number; vx: number; vy: number } {
    const currentAngle = particle.angle;
    const sensorAngleRad = (settings.sensorAngle * Math.PI) / 180;
    
    const leftSensor = {
      x: particle.x + Math.cos(currentAngle - sensorAngleRad) * settings.sensorDistance,
      y: particle.y + Math.sin(currentAngle - sensorAngleRad) * settings.sensorDistance
    };
    
    const frontSensor = {
      x: particle.x + Math.cos(currentAngle) * settings.sensorDistance,
      y: particle.y + Math.sin(currentAngle) * settings.sensorDistance
    };
    
    const rightSensor = {
      x: particle.x + Math.cos(currentAngle + sensorAngleRad) * settings.sensorDistance,
      y: particle.y + Math.sin(currentAngle + sensorAngleRad) * settings.sensorDistance
    };

    const leftTrail = this.senseTrail(leftSensor, particles, settings);
    const frontTrail = this.senseTrail(frontSensor, particles, settings);
    const rightTrail = this.senseTrail(rightSensor, particles, settings);

    // Calculate desired turn based on sensor readings
    let desiredAngle = currentAngle;
    if (leftTrail > rightTrail) {
      desiredAngle = currentAngle - Math.PI / 4;
    } else if (rightTrail > leftTrail) {
      desiredAngle = currentAngle + Math.PI / 4;
    } else if (frontTrail < Math.min(leftTrail, rightTrail)) {
      desiredAngle = currentAngle + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 2;
    }

    // Apply turn rate limitation
    const newAngle = this.limitAngleChange(
      currentAngle,
      desiredAngle,
      settings.turnRate * Math.PI
    );

    // Calculate velocity based on new angle
    const vx = particle.vx + Math.cos(newAngle);
    const vy = particle.vy + Math.sin(newAngle);

    // Apply external forces
    let finalVx = vx;
    let finalVy = vy;
    if (settings.externalForceStrength > 0) {
      const angleRad = (settings.externalForceAngle * Math.PI) / 180;
      finalVx += Math.cos(angleRad) * settings.externalForceStrength;
      finalVy += Math.sin(angleRad) * settings.externalForceStrength;
    }

    return { angle: newAngle, vx: finalVx, vy: finalVy };
  }

  private static senseTrail(
    sensor: { x: number; y: number },
    particles: ParticleType[],
    settings: SimulationSettings
  ): number {
    return particles.reduce((sum, p) => {
      const dx = sensor.x - p.x;
      const dy = sensor.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return sum + (dist < settings.sensorDistance ? 1 : 0);
    }, 0);
  }

  static normalizeVelocity(vx: number, vy: number, speedMultiplier: number): { vx: number; vy: number } {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 0) {
      return {
        vx: (vx / speed) * speedMultiplier * 2,
        vy: (vy / speed) * speedMultiplier * 2
      };
    }
    return { vx, vy };
  }

  private static limitAngleChange(
    currentAngle: number,
    targetAngle: number,
    maxTurnRate: number
  ): number {
    // Normalize angle difference to [-π, π]
    let diff = targetAngle - currentAngle;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    
    // Limit the turn rate
    if (Math.abs(diff) > maxTurnRate) {
      diff = Math.sign(diff) * maxTurnRate;
    }
    
    return currentAngle + diff;
  }
}