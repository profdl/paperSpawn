import paper from 'paper';
import { ParticleService } from './particleService';
import { ObstacleManager } from './managers/obstacleManager';

export class SVGManager {
  constructor(
    private project: paper.Project,
    private particleService: ParticleService,  // Changed from ParticleManager
    private obstacleManager: ObstacleManager
  ) {}

  loadSVG(svgElement: SVGElement): void {
    const item = this.project.importSVG(svgElement);
    
    item.children.forEach((child: paper.Item) => {
      if (child instanceof paper.Group && child.data.isParticle) {
        const position = child.position;
        this.particleService.createParticle(position.x, position.y);  // Updated method call
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
