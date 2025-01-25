import paper from 'paper';
import { ObstacleManager } from '../obstacleManager';

export class ParticleCreator {
  static create(
    x: number,
    y: number,
    particleColor: string,
    trailColor: string,
    particleRadius: number,
    trailWidth: number,
    obstacleManager: ObstacleManager
  ): paper.Group | null {
    const position = new paper.Point(x, y);

    const obstacles = obstacleManager.getAllClosedPaths();
    for (const obstacle of obstacles) {
      if (obstacle.contains(position)) {
        return null;
      }
    }

    const particle = new paper.Group();

    const point = new paper.Path.Circle({
      center: position,
      radius: particleRadius,
      fillColor: particleColor
    });

    const trail = new paper.Path({
      strokeColor: trailColor,
      strokeWidth: trailWidth,
      strokeCap: 'round',
      opacity: 1
    });
    trail.add(new paper.Point(x, y));

    particle.addChildren([point, trail]);
    particle.data = {
      velocity: new paper.Point(0, 0),
      createdAt: Date.now(),
      state: 'active',
      activeTrail: trail 
    };

    return particle;
  }
}