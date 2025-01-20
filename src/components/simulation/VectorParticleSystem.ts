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


  constructor(canvas: HTMLCanvasElement) {
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(500, 400);
    this.project = paper.project;
    
    this.rectangleManager = new RectangleManager();
    this.particleManager = new ParticleManager();
    this.eraserTool = new EraserTool();
    this.background = new CanvasBackground(this.project.view.bounds);
    
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


  setBackgroundColor(color: string): void {
    this.background.setColor(color);
  }

  createParticle(x: number, y: number): paper.Group {
    const particleColor = this.project.view.element.dataset.particleColor || '#000000';
    const trailColor = this.project.view.element.dataset.trailColor || '#8b8680';
    return this.particleManager.createParticle(x, y, particleColor, trailColor);
  }

  updateParticles(settings: SimulationSettings): void {
    const view = this.project.view;
    this.particleManager.updateParticles(
      settings, 
      view.bounds.width, 
      view.bounds.height,
      (position) => this.rectangleManager.calculateAvoidanceForce(position)
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
}