import paper from 'paper';
import { SimulationSettings } from '../../types';
import { FlockingForce } from '../forces/FlockingForce';
import { MagnetismForce } from '../forces/MagnetismForce';
import { WanderForce } from '../forces/WanderForce';
import { ExternalForce } from '../forces/ExternalForce';
import { AvoidanceForce } from '../forces/AvoidanceForce';
import { ObstacleManager } from '../core/managers/obstacleManager';
import { AggregationForce } from '../forces/AggregateForce';
import { BGColorForce } from '../forces/BGColorForce';
import {VectorParticleSystem} from './VectorParticleSystem';

export class ParticleUpdater {
  static update(
    particle: paper.Group,
    particles: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number,
    obstacleManager: ObstacleManager,
    particleSystem: VectorParticleSystem 
    ): void {

    if (particle.data.isSeed) {
      // Ensure seed particles have zero velocity and don't move
      particle.data.velocity = new paper.Point(0, 0);
      particle.data.state = 'frozen';
      return;
    }
  const trail = particle.children[0] as paper.Path;
  const point = particle.children[1] as paper.Path.Circle;
  const age = Date.now() - particle.data.createdAt;
  let velocity = particle.data.velocity;





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

        //DLA FREEZE
        if (settings.dlaEnabled && !particle.data.isSeed) {
          // Check for nearby seeds or frozen particles
          for (const other of particles.children) {
            if (other === particle) continue;
            if (other.data.isSeed || other.data.isStuck) {
              const distance = point.position.getDistance(other.children[1].position);
              if (distance <= settings.dlaSnapDistance) {
                // Calculate ideal position based on spacing
                const direction = point.position.subtract(other.children[1].position);
                const idealPosition = other.children[1].position.add(
                  direction.normalize().multiply(settings.dlaSnapSpacing)
                );
                
                // Move to ideal position and freeze
                point.position = idealPosition;
                particle.data.isStuck = true;
                particle.data.state = 'frozen';
                velocity.set(0, 0);
                return;
              }
            }
          }
        }

// BG COLOR FORCE
// Handle Image Forces
if (settings.bgColorForceEnabled && settings.bgColorForceStrength > 0) {
  const bgColorForce = BGColorForce.calculate(particle, particleSystem, settings);
  if (bgColorForce.length > 0) {
    if (particle.data.isReflected) {
      const dot = bgColorForce.dot(velocity.normalize());
      const blendFactor = dot < 0 ? 0.3 : 1.0;
      finalForce = finalForce.add(bgColorForce.multiply(blendFactor));
    } else {
      finalForce = finalForce.add(bgColorForce);
    }
    totalWeight += settings.bgColorForceStrength;
  }
}

// Handle Image Displacement (separate from forces)
if (settings.bgColorDisplaceEnabled && settings.bgColorDisplaceDistance > 0) {
  const displacement = BGColorForce.calculateDisplacement(particle, particleSystem, settings);
  if (displacement.length > 0) {
    const circle = particle.children[1] as paper.Path.Circle;
    const trail = particle.children[0] as paper.Path;
    
    const originalPosition = circle.position.clone();
    const displacedPosition = originalPosition.add(displacement);
    circle.position = displacedPosition;
    
    if (trail.visible && trail.segments.length > 0) {
      const lastSegment = trail.lastSegment;
      if (lastSegment) {
        lastSegment.point = displacedPosition;
      }
    }
  }
}



        // FLOCKING
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



        //AGGREGATION
        if (settings.aggregationEnabled) {
          const aggregationForce = AggregationForce.calculate(particle, particles, settings);
          if (aggregationForce.length > 0) {
            // Give higher priority to aggregation forces
            const aggregationWeight = 2.0; // Increased weight for aggregation
            if (particle.data.isReflected) {
              const dot = aggregationForce.dot(velocity.normalize());
              const blendFactor = dot < 0 ? 0.3 : 1.0;
              finalForce = finalForce.add(aggregationForce.multiply(blendFactor * aggregationWeight));
            } else {
              finalForce = finalForce.add(aggregationForce.multiply(aggregationWeight));
            }
            totalWeight += aggregationWeight;
          }
        }

        // MAGNETISM
        if (settings.magnetismEnabled && settings.magnetismStrength > 0) {
          const magneticForce = MagnetismForce.calculate(particle, particles, settings);
          if (magneticForce.length > 0) {
            if (particle.data.isReflected) {
              const dot = magneticForce.dot(velocity.normalize());
              const blendFactor = dot < 0 ? 0.3 : 1.0;
              finalForce = finalForce.add(magneticForce.multiply(settings.magnetismStrength * blendFactor));
            } else {
              finalForce = finalForce.add(magneticForce.multiply(settings.magnetismStrength));
            }
            totalWeight += settings.magnetismStrength;
          }
        }

        // WANDER
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

        // EXTERNAL FORCES
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

      // AVOIDANCE
      if (settings.avoidanceEnabled) {
        const avoidanceForce = AvoidanceForce.calculate(point.position, obstacleManager, settings);
        finalForce = finalForce.add(avoidanceForce);
      }

      // REFLECTION
      if (particle.data.isReflected) {
        // Blend current velocity with new forces
        velocity = velocity.multiply(0).add(finalForce.multiply(-1));
      } else {
        velocity = velocity.add(finalForce);
      }

      // SPEED
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

      // BOUNDARY BEHAVIOR
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
          let wrapped = false;

          if (newPosition.x < 0) {
            newPosition.x = width;
            wrapped = true;
          } else if (newPosition.x > width) {
            newPosition.x = 0;
            wrapped = true;
          }

          if (newPosition.y < 0) {
            newPosition.y = height;
            wrapped = true;
          } else if (newPosition.y > height) {
            newPosition.y = 0;
            wrapped = true;
          }

          if (wrapped) {
            // Clear existing trail
            trail.removeSegments();
            // Start new trail at wrapped position
            trail.add(newPosition);
          }

          point.position = newPosition;

          if (!wrapped && settings.paintingModeEnabled && particle.data.state === 'active') {
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
            AggregationForce.cleanup(particle.id, particles);  // Add this line
            particle.remove();
            return;
          }
          break;
      }

    if (!particle.data.isSeed) {
      point.position = point.position.add(velocity);
      
      if (settings.paintingModeEnabled && particle.data.state === 'active') {
        trail.visible = true;
        trail.add(point.position);
        trail.smooth();
      }
    }

    particle.data.velocity = velocity;
  }
  }}