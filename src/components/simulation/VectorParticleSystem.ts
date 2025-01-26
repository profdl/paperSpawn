import paper from 'paper';
import { SimulationSettings } from '../../types';
import { ObstacleManager } from './obstacleManager';
import { ParticleManager } from './particleManager';
import { EraserTool } from './eraserTool';
import { CanvasBackground } from './canvasBackground';
import { CanvasManager } from './canvasManager';
import { SVGManager } from './svgManager';
import { DLAggregateForce } from './forces/DLAggregateForce';

export class VectorParticleSystem {
  private canvasManager: CanvasManager;
  private obstacleManager: ObstacleManager;
  private particleManager: ParticleManager;
  private eraserTool: EraserTool;
  private background: CanvasBackground;
  private svgManager: SVGManager;
  private particles!: paper.Group;
  


  constructor(canvas: HTMLCanvasElement, onResize?: (width: number, height: number) => void) {
    this.canvasManager = new CanvasManager(canvas, onResize);
  
    
    this.obstacleManager = new ObstacleManager();
    this.particleManager = new ParticleManager(this.obstacleManager);
    this.eraserTool = new EraserTool();
    
    this.background = new CanvasBackground(
      this.canvasManager.getProject().view.bounds,
      this.canvasManager.handleResize.bind(this.canvasManager)
    );
    
    this.svgManager = new SVGManager(
      this.canvasManager.getProject(),
      this.particleManager,
      this.obstacleManager
    );
  }

  // Delegate methods to appropriate managers
  loadSVG(svgElement: SVGElement): void {
    this.svgManager.loadSVG(svgElement);
  }

  clearObstacles(): void {
    this.obstacleManager.clearObstacles();
  }


  exportSVG(): string {
    return this.svgManager.exportSVG();
  }
  
  getClosedPaths(): paper.Path[] {
    return this.obstacleManager.getAllClosedPaths();
  }
  
  getViewDimensions(): { width: number; height: number } {
    return this.canvasManager.getViewDimensions();
  }

 

  setBackgroundImage(imageUrl: string): void {
    this.background.setImage(imageUrl);
  }



  
  isHandleAt(point: paper.Point): boolean {
    return this.obstacleManager.isHandleAt(point);
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    if (this.obstacleManager) {
      // Delegate transform handling to the rectangle manager
      this.obstacleManager.handleTransform(point, delta, shiftKey);
    }
  }

  getCanvasDimensions(): { width: number; height: number } {
    return this.canvasManager.getCanvasDimensions();
  }

  setBackgroundColor(color: string): void {
    this.background.setColor(color);
  }

  createParticle(x: number, y: number): paper.Group {
    const particleColor = this.canvasManager.getProject().view.element.dataset.particleColor || '#000000';
    const trailColor = this.canvasManager.getProject().view.element.dataset.trailColor || '#8b8680';
    const particle = this.particleManager.createParticle(x, y, particleColor, trailColor);
    if (!particle) {
      throw new Error('Failed to create particle');
    }
    
    // Initialize DLA state for the new particle
    if (!particle.data.aggregationState) {
      particle.data.aggregationState = {
        isStuck: false,
        isSeed: false,
        stickingProbability: Math.random(),
        aggregatedWith: new Set<number>()
      };
    }
    return particle;
  }

  getParticles(): paper.Group {
    return this.particleManager.getParticles();
  }

  updateParticles(settings: SimulationSettings): void {
    const view = this.canvasManager.getProject().view;
    
    // Check if particles exist and if DLA is enabled
    if (settings.aggregationEnabled && settings.isDLA && this.particleManager.getParticles()) {
      // Pass the obstacleManager when calling ensureSeeds
      DLAggregateForce.ensureSeeds(
        this.particleManager.getParticles(),
        settings,
        this.obstacleManager
      );
    }
    
    this.particleManager.updateParticles(
      settings,
      view.bounds.width,
      view.bounds.height
    );
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

  removeBackgroundImage(): void {
    this.background.removeBackgroundImage();
  }
  handleKeyboardShortcut(event: KeyboardEvent): void {
    this.obstacleManager.handleKeyboardShortcut(event);
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
    const particles = this.particleManager.getParticles();
    if (particles) {
      // First remove all connection lines
      (particles.children as paper.Group[]).forEach((particle: paper.Group) => {
        if (particle.data?.aggregationLines) {
          particle.data.aggregationLines.forEach((line: paper.Path) => {
            if (line && line.remove) {
              line.remove();
            }
          });
          particle.data.aggregationLines = [];
        }
      });
  
      // Reset DLA states
      DLAggregateForce.resetParticleStates(particles);
      
      // Then clear the particles
      this.particleManager.clear();
    }
  }
  
  clear(): void {
    if (this.particles) {
      DLAggregateForce.resetParticleStates(this.particles);
    }
    this.particleManager.clear();
    this.obstacleManager.clear();
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

 

  endTransform(): void {
    if (this.obstacleManager) {
      this.obstacleManager.endTransform();
    }
  }

  startFreehandPath(point: paper.Point): void {
    this.obstacleManager.startFreehandPath(point);
  }

  continueFreehandPath(point: paper.Point): void {
    this.obstacleManager.continueFreehandPath(point);
  }

  endFreehandPath(): void {
    this.obstacleManager.endFreehandPath();
  }

}