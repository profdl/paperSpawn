import paper from 'paper';
import { obstacleManager } from '../obstacleManager';

export class AvoidanceForce {
  static calculate(position: paper.Point, obstacleManager: obstacleManager): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30;
    const maxForce = 1.0;

    const obstacles = obstacleManager.getAllClosedPaths();

    for (const obstacle of obstacles) {
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
}