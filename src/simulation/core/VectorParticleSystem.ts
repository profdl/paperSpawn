import paper from 'paper';
import { SimulationSettings } from '../../types';
import { ObstacleManager } from './managers/obstacleManager';
import { ParticleService } from '../particleService';
import { EraserTool } from '../eraserTool';
import { CanvasBackground } from './managers/canvasBackground';
import { CanvasManager } from './managers/canvasManager';
import { SVGManager } from './managers/svgManager';

export class VectorParticleSystem {
  private canvasManager: CanvasManager;
  private obstacleManager: ObstacleManager;
  private particleService: ParticleService;
  private eraserTool: EraserTool;
  private background: CanvasBackground;
  private svgManager: SVGManager;

  constructor(canvas: HTMLCanvasElement, onResize?: (width: number, height: number) => void) {
    this.canvasManager = new CanvasManager(canvas, onResize);
    this.obstacleManager = new ObstacleManager();
    this.particleService = new ParticleService(
      this.obstacleManager, this);
    this.eraserTool = new EraserTool();
    
    this.background = new CanvasBackground(
      this.canvasManager.getProject().view.bounds,
      this.canvasManager.handleResize.bind(this.canvasManager)
    );
    
    this.svgManager = new SVGManager(
      this.canvasManager.getProject(),
      this.particleService,
      this.obstacleManager
    );
  }

  // SVG methods
  loadSVG(svgElement: SVGElement): void {
    this.svgManager.loadSVG(svgElement);
  }

  exportSVG(): string {
    return this.svgManager.exportSVG();
  }

  // Obstacle methods
  clearObstacles(): void {
    this.obstacleManager.clearObstacles();
  }

  getClosedPaths(): paper.Path[] {
    return this.obstacleManager.getAllClosedPaths();
  }

  // Background methods
  setBackgroundImage(imageUrl: string): void {
    this.background.setImage(imageUrl);
  }

  getBackgroundImage(): paper.Raster | null {
    return this.background.getBackgroundImage();
  }

  removeBackgroundImage(): void {
    this.background.removeBackgroundImage();
  }

  setBackgroundColor(color: string): void {
    this.background.setColor(color as "#000000");
  }

  // Obstacle interaction methods
  isHandleAt(point: paper.Point): boolean {
    return this.obstacleManager.isHandleAt(point);
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    this.obstacleManager?.handleTransform(point, delta, shiftKey);
  }

  endTransform(): void {
    this.obstacleManager?.endTransform();
  }

  startRectangle(x: number, y: number): paper.Path.Rectangle {
    return this.obstacleManager.create(x, y);
  }

  selectItemAt(point: paper.Point): void {
    this.obstacleManager.selectAt(point);
  }

  clearSelection(): void {
    this.obstacleManager.clearSelection();
  }

  handleKeyboardShortcut(event: KeyboardEvent): void {
    this.obstacleManager.handleKeyboardShortcut(event);
  }

  // Particle methods
  createParticle(x: number, y: number, isSeed: boolean = false): paper.Group {
    const particleColor = this.canvasManager.getProject().view.element.dataset.particleColor || '#000000';
    const trailColor = this.canvasManager.getProject().view.element.dataset.trailColor || '#8b8680';
    
    return this.particleService.createParticle(x, y, particleColor, trailColor, isSeed);
  }

  getParticles(): paper.Group {
    return this.particleService.getParticles();
  }

  updateParticles(settings: SimulationSettings): void {
    const view = this.canvasManager.getProject().view;
    this.particleService.updateParticles(settings, view.bounds.width, view.bounds.height);
  }

  clearParticlesOnly(): void {
    this.particleService.clear();
  }

  setColors(settings: SimulationSettings): void {
    this.particleService.setColors(settings.particleColor, settings.trailColor);
  }

  setParticleRadius(radius: number): void {
    this.particleService.setParticleRadius(radius);
  }

  setTrailWidth(width: number): void {
    this.particleService.setTrailWidth(width);
  }

  // Eraser methods
  eraseParticlesNear(x: number, y: number, radius: number): void {
    this.eraserTool.showEraserCircle(x, y, radius);
    const position = new paper.Point(x, y);
    this.particleService.removeParticlesInRadius(position, radius);
  }

  hideEraserCircle(): void {
    this.eraserTool.hideEraserCircle();
  }

  // Canvas methods
  getViewDimensions(): { width: number; height: number } {
    return this.canvasManager.getViewDimensions();
  }

  getCanvasDimensions(): { width: number; height: number } {
    return this.canvasManager.getCanvasDimensions();
  }

  // Freehand methods
  startFreehandPath(point: paper.Point): void {
    this.obstacleManager.startFreehandPath(point);
  }

  continueFreehandPath(point: paper.Point): void {
    this.obstacleManager.continueFreehandPath(point);
  }

  endFreehandPath(): void {
    this.obstacleManager.endFreehandPath();
  }

  // General methods
  clear(): void {
    this.particleService.clear();
    this.obstacleManager.clear();
    paper.view.update();
  }
}