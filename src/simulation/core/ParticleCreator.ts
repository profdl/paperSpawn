import paper from 'paper';
import { ObstacleManager } from '../managers/obstacleManager';

export class ParticleCreator {
  static create(
    x: number,
    y: number,
    particleColor: string,
    trailColor: string,
    particleRadius: number,
    trailWidth: number,
    obstacleManager: ObstacleManager,
    isSeed: boolean = false
  ): paper.Group | null {
    const position = new paper.Point(x, y);

    const obstacles = obstacleManager.getAllClosedPaths();
    for (const obstacle of obstacles) {
      if (obstacle.contains(position)) {
        return null;
      }
    }

    const particle = new paper.Group();

    // Create trail first so it renders behind the point
  const trail = new paper.Path({
    strokeColor: trailColor,
    strokeWidth: trailWidth,
    strokeCap: 'round',
    opacity: 1,
    visible: !isSeed  // Hide trail for seeds
  });
  trail.add(new paper.Point(x, y));
  
  // Create point after trail so it renders on top
  const point = new paper.Path.Circle({
    center: position,
    radius: particleRadius,
    fillColor: particleColor
  });

  particle.addChildren([trail, point]);
  
  particle.data = {
    velocity: new paper.Point(0, 0),
    createdAt: Date.now(),
    state: isSeed ? 'frozen' : 'active',
    isSeed: isSeed,
    isStuck: isSeed
  };

  return particle;
}}