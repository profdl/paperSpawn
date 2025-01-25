import paper from 'paper';
import { SimulationSettings } from '../../../types';
import { FlockingForce } from '../forces/FlockingForce';
import { WanderForce } from '../forces/WanderForce';
import { ExternalForce } from '../forces/ExternalForce';
import { AvoidanceForce } from '../forces/AvoidanceForce';
import { ObstacleManager } from '../obstacleManager';

export class ParticleUpdater {
  static update(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number,
    obstacleManager: ObstacleManager
  ): void {
    const trail = particle.children[0] as paper.Path;
    const point = particle.children[1] as paper.Path.Circle;
    const position = point.position;
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

    // Track reflection state in particle data
    if (!particle.data.hasOwnProperty('isReflected')) {
      particle.data.isReflected = false;
    }

    if (particle.data.state === 'active') {
      let finalForce = new paper.Point(0, 0);
      let totalWeight = 0;

      const bounceComplete = !particle.data.bounceCooldown ||
        Date.now() > particle.data.bounceCooldown;

      if (bounceComplete) {
        // Only calculate flocking forces if enabled
        if (settings.flockingEnabled) {
          const flockingForces = FlockingForce.calculate(particle, particles, settings);
          
          const forces = [
            { force: flockingForces.separation.multiply(settings.separation), weight: settings.separation },
            { force: flockingForces.cohesion.multiply(settings.cohesion), weight: settings.cohesion },
            { force: flockingForces.alignment.multiply(settings.alignment), weight: settings.alignment }
          ];

          for (const { force, weight } of forces) {
            if (force.length > 0) {
              if (particle.data.isReflected) {
                const dot = force.dot(velocity.normalize());
                const blendFactor = dot < 0 ? 0.3 : 1.0;
                finalForce = finalForce.add(force.multiply(blendFactor));
              } else {
                finalForce = finalForce.add(force);
              }
              totalWeight += weight;
            }
          }
        }

        // Only calculate wander forces if enabled
        if (settings.wanderEnabled && settings.wanderStrength > 0) {
          const wanderForce = WanderForce.calculate(particle, settings);
          if (wanderForce.length > 0) {
            if (particle.data.isReflected) {
              const dot = wanderForce.dot(velocity.normalize());
              const blendFactor = dot < 0 ? 0.3 : 1.0;
              finalForce = finalForce.add(wanderForce.multiply(settings.wanderStrength * blendFactor));
            } else {
              finalForce = finalForce.add(wanderForce.multiply(settings.wanderStrength));
            }
            totalWeight += settings.wanderStrength;
          }
        }

        // Only calculate external forces if enabled
        if (settings.externalForcesEnabled && settings.externalForceStrength > 0) {
          const externalForce = ExternalForce.calculate(settings, particle);
          if (externalForce.length > 0) {
            if (particle.data.isReflected) {
              const dot = externalForce.dot(velocity.normalize());
              const blendFactor = dot < 0 ? 0.3 : 1.0;
              finalForce = finalForce.add(externalForce.multiply(settings.externalForceStrength * blendFactor));
            } else {
              finalForce = finalForce.add(externalForce.multiply(settings.externalForceStrength));
            }
            totalWeight += settings.externalForceStrength;
          }
        }
      }

      if (totalWeight > 0) {
        finalForce = finalForce.divide(totalWeight);
      }

      finalForce = finalForce.multiply(settings.speed);

      // Only calculate avoidance forces if enabled
      if (settings.avoidanceEnabled) {
        const avoidanceForce = AvoidanceForce.calculate(point.position, obstacleManager, settings);
        finalForce = finalForce.add(avoidanceForce);
      }

      // Blend the final force with the current velocity for reflected particles
      if (particle.data.isReflected) {
        // Blend current velocity with new forces
        velocity = velocity.multiply(0).add(finalForce.multiply(-1));
      } else {
        velocity = velocity.add(finalForce);
      }

      // Speed control
      if (particle.data.isReflected) {
        const currentSpeed = particle.data.reflectedSpeed || (settings.speed * 1);
        velocity = velocity.normalize().multiply(currentSpeed);
      } else {
        const maxVelocity = settings.speed * 1;
        if (velocity.length > maxVelocity) {
          velocity = velocity.normalize().multiply(maxVelocity);
        }
      }



      const newPosition = point.position.add(velocity);



      switch (settings.boundaryBehavior) {
        case 'reflect':
          let reflected = false;

          if (newPosition.x < 0 || newPosition.x > width) {
            velocity.x *= -1;
            newPosition.x = newPosition.x < 0 ? 0 : width;
            reflected = true;
          }

          if (newPosition.y < 0 || newPosition.y > height) {
            velocity.y *= -1;
            newPosition.y = newPosition.y < 0 ? 0 : height;
            reflected = true;
          }

          if (reflected) {
            particle.data.isReflected = true;
            particle.data.reflectedSpeed = velocity.length;
            particle.data.velocity = velocity;
          }
          break;

        case 'wrap-around':
          // Check if we need to wrap
          if (newPosition.x < 0 || newPosition.x > width ||
            newPosition.y < 0 || newPosition.y > height) {
            // Complete current trail segment before wrapping
            if (settings.paintingModeEnabled && particle.data.state === 'active') {
              trail.add(point.position);
              trail.smooth();
            }

            // Calculate wrapped position
            newPosition.x = ((newPosition.x + width) % width);
            newPosition.y = ((newPosition.y + height) % height);

            // Create new trail
            const newTrail = new paper.Path({
              strokeColor: trail.strokeColor,
              strokeWidth: trail.strokeWidth,
              strokeCap: 'round',
              opacity: trail.opacity
            });
            newTrail.add(newPosition);

            // Replace old trail with new one
            trail.remove();
            particle.addChild(newTrail);
            particle.children[1] = newTrail;
          } else if (settings.paintingModeEnabled && particle.data.state === 'active') {
            // Normal trail behavior when not wrapping
            trail.visible = true;
            trail.add(newPosition);
            trail.smooth();
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