import paper from 'paper';
import { VectorParticleSystem } from './core/VectorParticleSystem';
import { Tool, SimulationSettings } from '../types';

export class CanvasEventHandler {
  private isDrawingRef: { current: boolean };
  private lastDrawPosRef: { current: { x: number; y: number } | null };
  private lastSpawnTimeRef: { current: number };
  private currentSettingsRef: { current: SimulationSettings };
  private systemRef: React.MutableRefObject<VectorParticleSystem | undefined>;

  constructor(
    isDrawingRef: { current: boolean },
    lastDrawPosRef: { current: { x: number; y: number } | null },
    lastSpawnTimeRef: { current: number },
    currentSettingsRef: { current: SimulationSettings },
    systemRef: React.MutableRefObject<VectorParticleSystem | undefined>
  ) {
    this.isDrawingRef = isDrawingRef;
    this.lastDrawPosRef = lastDrawPosRef;
    this.lastSpawnTimeRef = lastSpawnTimeRef;
    this.currentSettingsRef = currentSettingsRef;
    this.systemRef = systemRef;
  }

   getViewPoint(e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): paper.Point {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return paper.view.viewToProject(new paper.Point(x, y));
  }

  handleMouseDown(
    e: React.MouseEvent<HTMLCanvasElement>,
    currentTool: Tool,
    canvas: HTMLCanvasElement,
    eraserSize: number
  ): void {
    if (currentTool === 'none' || !this.systemRef.current) return;

    const point = this.getViewPoint(e, canvas);
    this.isDrawingRef.current = true;
    this.lastDrawPosRef.current = { x: point.x, y: point.y };

    switch (currentTool) {
      case 'select':
        if (this.systemRef.current.isHandleAt(point)) {
          this.isDrawingRef.current = true;
        } else {
          this.systemRef.current.selectItemAt(point);
        }
        break;
      case 'freehand':
        this.systemRef.current.startFreehandPath(point);
        break;
      case 'paint':
        this.systemRef.current.createParticle(point.x, point.y);
        break;
      case 'erase':
        this.systemRef.current.eraseParticlesNear(point.x, point.y, eraserSize);
        break;
      case 'seed':
        this.systemRef.current.createParticle(point.x, point.y, true);
        break;
    }
  }

  handleMouseMove(
    e: React.MouseEvent<HTMLCanvasElement>,
    currentTool: Tool,
    canvas: HTMLCanvasElement,
    eraserSize: number
  ): void {
    if (currentTool === 'none' || !this.systemRef.current) return;

    const point = this.getViewPoint(e, canvas);

    switch (currentTool) {
      case 'select':
        if (this.isDrawingRef.current && this.lastDrawPosRef.current) {
          const delta = new paper.Point(
            point.x - this.lastDrawPosRef.current.x,
            point.y - this.lastDrawPosRef.current.y
          );
          this.systemRef.current.handleTransform(point, delta, e.shiftKey);
          this.lastDrawPosRef.current = { x: point.x, y: point.y };
        }
        break;
      case 'freehand':
        if (this.isDrawingRef.current) {
          this.systemRef.current.continueFreehandPath(point);
        }
        break;
      case 'paint':
        if (this.isDrawingRef.current && this.lastDrawPosRef.current) {
          const currentTime = Date.now();
          const currentSpawnRate = this.currentSettingsRef.current.paintSpawnRate;
          const spawnDelay = Math.round(100 * (1 - (currentSpawnRate - 1) / 49));

          if (currentTime - this.lastSpawnTimeRef.current >= spawnDelay) {
            const { x: lastX, y: lastY } = this.lastDrawPosRef.current;
            const dx = point.x - lastX;
            const dy = point.y - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(1, Math.floor(distance / 5));

            for (let i = 0; i < steps; i++) {
              const px = lastX + (dx * i) / steps;
              const py = lastY + (dy * i) / steps;
              this.systemRef.current.createParticle(px, py);
            }

            this.lastSpawnTimeRef.current = currentTime;
          }
          this.lastDrawPosRef.current = { x: point.x, y: point.y };
        }
        break;
      case 'erase':
        if (this.isDrawingRef.current) {
          this.systemRef.current.eraseParticlesNear(point.x, point.y, eraserSize);
        }
        break;
    }
  }

  handleMouseUp(currentTool: Tool): void {
    if (!this.systemRef.current) return;

    if (currentTool === 'freehand' && this.isDrawingRef.current) {
      this.systemRef.current.endFreehandPath();
    }

    this.isDrawingRef.current = false;
    this.lastDrawPosRef.current = null;

    if (currentTool === 'select') {
      this.systemRef.current.endTransform();
    } else if (currentTool !== 'rectangle') {
      this.systemRef.current.hideEraserCircle();
    }
  }
}
