import paper from 'paper';
import { SimulationSettings } from '../../types';
import { RectangleManager } from './rectangleManager';
import { ParticleManager } from './particleManager';
import { EraserTool } from './eraserTool';
import { CanvasBackground } from './canvasBackground';


export class VectorParticleSystem {
  private project: paper.Project;
  private rectangleManager: RectangleManager;
  private particleManager: ParticleManager;
  private eraserTool: EraserTool;
  private background: CanvasBackground;
  private onResizeCallback?: (width: number, height: number) => void;
  public clearObstacles(): void {
    this.rectangleManager.clearObstacles();
  }

  constructor(canvas: HTMLCanvasElement, onResize?: (width: number, height: number) => void) {
    this.onResizeCallback = onResize;
    
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(500, 400);
    this.project = paper.project;
    
    this.rectangleManager = new RectangleManager();
    this.particleManager = new ParticleManager(this.rectangleManager);
    this.eraserTool = new EraserTool();
    this.background = new CanvasBackground(
      this.project.view.bounds,
      (width, height) => {
        // Update Paper.js view size
        paper.view.viewSize = new paper.Size(width, height);
        
        // Call the external resize callback if provided
        if (this.onResizeCallback) {
          this.onResizeCallback(width, height);
        }
      }
    );
    
    paper.view.update();
  }

  setBackgroundImage(imageUrl: string): void {
    this.background.setImage(imageUrl);
  }

  loadSVG(svgElement: SVGElement): void {
    this.clear();
    const item = this.project.importSVG(svgElement);
    item.children.forEach((child: paper.Item) => {
      if (child instanceof paper.Group && child.data.isParticle) {
        const position = child.position;
        this.createParticle(position.x, position.y);
        child.remove();
      } else if (child instanceof paper.Path && child.data.isObstacle) {
        const rectangle = new paper.Path.Rectangle(child.bounds);
        rectangle.rotation = child.rotation;
        this.rectangleManager.importRectangle(rectangle);
        child.remove();
      }
    });
    item.remove();
    paper.view.update();
  }


  
  isHandleAt(point: paper.Point): boolean {
    return this.rectangleManager.isHandleAt(point);
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    if (this.rectangleManager) {
      // Delegate transform handling to the rectangle manager
      this.rectangleManager.handleTransform(point, delta, shiftKey);
    }
  }
  getCanvasDimensions(): { width: number; height: number } {
    const canvas = this.project.view.element as HTMLCanvasElement;
    return {
      width: canvas.width,
      height: canvas.height
    };
  }

  setBackgroundColor(color: string): void {
    this.background.setColor(color);
  }

  createParticle(x: number, y: number): paper.Group {
    const particleColor = this.project.view.element.dataset.particleColor || '#000000';
    const trailColor = this.project.view.element.dataset.trailColor || '#8b8680';
    const particle = this.particleManager.createParticle(x, y, particleColor, trailColor);
    if (!particle) {
      throw new Error('Failed to create particle');
    }
    return particle;
  }

  updateParticles(settings: SimulationSettings): void {
    const view = this.project.view;
    // Simplified call without passing avoidance calculation
    this.particleManager.updateParticles(
      settings, 
      view.bounds.width, 
      view.bounds.height
    );
  }

  // Rectangle-related methods
  startRectangle(x: number, y: number): paper.Path.Rectangle {
    return this.rectangleManager.create(x, y);
}

  selectItemAt(point: paper.Point): void {
    this.rectangleManager.selectAt(point);
  }

  clearSelection(): void {
    this.rectangleManager.clearSelection();
  }

  handleKeyboardShortcut(event: KeyboardEvent): void {
    this.rectangleManager.handleKeyboardShortcut(event);
  }

  // Eraser-related methods
  eraseParticlesNear(x: number, y: number, radius: number): void {
    this.eraserTool.showEraserCircle(x, y, radius);
    const position = new paper.Point(x, y);
    this.particleManager.removeParticlesInRadius(position, radius);
  }

  hideEraserCircle(): void {
    this.eraserTool.hideEraserCircle();
  }

  // General methods
  clearParticlesOnly(): void {
    this.particleManager.clear();
  }
  clear(): void {
    this.particleManager.clear();
    this.rectangleManager.clear();
    paper.view.update();
  }

  setColors(settings: SimulationSettings): void {
    this.particleManager.setColors(settings.particleColor, settings.trailColor);
    paper.view.update();
  }

  setParticleRadius(radius: number): void {
    this.particleManager.setParticleRadius(radius);
    paper.view.update();
  }

  setTrailWidth(width: number): void {
    this.particleManager.setTrailWidth(width);
    paper.view.update();
  }

  exportSVG(): string {
    return this.project.exportSVG({ asString: true }) as string;
  }

  endTransform(): void {
    if (this.rectangleManager) {
      this.rectangleManager.endTransform();
    }
  }

  startFreehandPath(point: paper.Point): void {
    this.rectangleManager.startFreehandPath(point);
  }

  continueFreehandPath(point: paper.Point): void {
    this.rectangleManager.continueFreehandPath(point);
  }

  endFreehandPath(): void {
    this.rectangleManager.endFreehandPath();
  }

}