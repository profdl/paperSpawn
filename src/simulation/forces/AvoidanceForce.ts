import paper from 'paper';
import { SimulationSettings } from '../../types';
import { ObstacleManager } from '../managers/obstacleManager';

export class AvoidanceForce {
  static calculate(
    position: paper.Point, 
    obstacleManager: ObstacleManager,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.avoidanceEnabled) return new paper.Point(0, 0);

    const avoidanceForce = new paper.Point(0, 0);
    const obstacles = obstacleManager.getAllClosedPaths();

    for (const obstacle of obstacles) {
      const nearestPoint = obstacle.getNearestPoint(position);
      const diff = position.subtract(nearestPoint);
      const distance = diff.length;

      if (distance < settings.avoidanceDistance) {
        const isInside = obstacle.contains(position);

        if (isInside) {
          avoidanceForce.set(
            avoidanceForce.x + diff.x * settings.avoidanceStrength * settings.avoidancePushMultiplier,
            avoidanceForce.y + diff.y * settings.avoidanceStrength * settings.avoidancePushMultiplier
          );
        } else {
          const force = Math.min(
            settings.avoidanceStrength,
            Math.pow(settings.avoidanceDistance - distance, 2) / 
            (settings.avoidanceDistance * settings.avoidanceDistance)
          );
          const normalizedForce = diff.normalize().multiply(force);
          avoidanceForce.set(
            avoidanceForce.x + normalizedForce.x,
            avoidanceForce.y + normalizedForce.y
          );
        }
      }
    }

    if (avoidanceForce.length > settings.avoidanceStrength) {
      avoidanceForce.length = settings.avoidanceStrength;
    }

    return avoidanceForce;
  }
}