import paper from 'paper';
import { ParticleManager } from './particleManager';
import { ObstacleManager } from './obstacleManager';

export class SVGManager {
  constructor(
    private project: paper.Project,
    private particleManager: ParticleManager,
    private obstacleManager: ObstacleManager
  ) {}

  loadSVG(svgElement: SVGElement): void {
    const item = this.project.importSVG(svgElement);
    
    item.children.forEach((child: paper.Item) => {
      if (child instanceof paper.Group && child.data.isParticle) {
        const position = child.position;
        this.particleManager.createParticle(position.x, position.y);
        child.remove();
      } else if (child instanceof paper.Path && child.data.isObstacle) {
        const rectangle = new paper.Path.Rectangle(child.bounds);
        rectangle.rotation = child.rotation;
        this.obstacleManager.importRectangle(rectangle);
        child.remove();
      }
    });
    
    item.remove();
    paper.view.update();
  }

  exportSVG(): string {
    return this.project.exportSVG({ asString: true }) as string;
  }
}
