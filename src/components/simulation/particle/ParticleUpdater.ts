import paper from 'paper';
import { SimulationSettings } from '../../../types';
import { FlockingForce } from '../forces/FlockingForce';
import { WanderForce } from '../forces/WanderForce';
import { ExternalForce } from '../forces/ExternalForce';
import { AvoidanceForce } from '../forces/AvoidanceForce';
import { obstacleManager } from '../obstacleManager';

export class ParticleUpdater {
  static update(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number,
    obstacleManager: obstacleManager
  ): void {
    const point = particle.children[0] as paper.Path.Circle;
    const trail = particle.children[1] as paper.Path;
    const age = Date.now() - particle.data.createdAt;
    let velocity = particle.data.velocity;

    if (particle.data.state === 'stopped') {
      return;
    }

    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'active' && age >= settings.activeStateDuration) {
        particle.data.state = 'frozen';
      }
    } else {
      particle.data.state = 'active';
      trail.visible = false;
    }

    if (particle.data.state === 'active') {
      let finalForce = new paper.Point(0, 0);
      let totalWeight = 0;

      const bounceComplete = !particle.data.bounceCooldown ||
        Date.now() > particle.data.bounceCooldown;

      if (bounceComplete) {
        if (settings.flockingEnabled) {
          const flockingForces = FlockingForce.calculate(particle, particles, settings);

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

        if (settings.wanderEnabled && settings.wanderStrength > 0) {
          const wanderForce = WanderForce.calculate(particle, settings);
          if (wanderForce.length > 0) {
            finalForce = finalForce.add(wanderForce.multiply(settings.wanderStrength));
            totalWeight += settings.wanderStrength;
          }
        }
      }

      if (settings.externalForceStrength > 0) {
        const externalForce = ExternalForce.calculate(settings, particle);
        if (externalForce.length > 0) {
          finalForce = finalForce.add(externalForce.multiply(settings.externalForceStrength));
          totalWeight += settings.externalForceStrength;
        }
      }

      if (totalWeight > 0) {
        finalForce = finalForce.divide(totalWeight);
      }

      finalForce = finalForce.multiply(settings.speed);

      const avoidanceForce = AvoidanceForce.calculate(point.position, obstacleManager);
      finalForce = finalForce.add(avoidanceForce);

      velocity = velocity.add(finalForce);

      const maxVelocity = settings.speed * 1;
      if (velocity.length > maxVelocity) {
        velocity = velocity.normalize().multiply(maxVelocity);
      }

      const newPosition = point.position.add(velocity);

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

      point.position = newPosition;

      if (settings.paintingModeEnabled && particle.data.state === 'active') {
        trail.visible = true;
        trail.add(newPosition);
        trail.smooth();
      }

      particle.data.velocity = velocity;
    }

    point.opacity = settings.paintingModeEnabled && particle.data.state === 'frozen' ? 1 : 1;
  }
}