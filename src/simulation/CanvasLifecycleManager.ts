import paper from 'paper';
import { SimulationSettings } from '../types';
import { VectorParticleSystem } from './core/VectorParticleSystem';
import { CANVAS_DIMENSIONS } from '../components/layout/constants';

export class CanvasLifecycleManager {
  private animationFrameRef: { current: number | undefined };
  private systemRef: React.MutableRefObject<VectorParticleSystem | undefined>;
  private isInitializedRef: { current: boolean };
  
  constructor(
    animationFrameRef: { current: number | undefined },
    systemRef: React.MutableRefObject<VectorParticleSystem | undefined>,
    isInitializedRef: { current: boolean }
  ) {
    this.animationFrameRef = animationFrameRef;
    this.systemRef = systemRef;
    this.isInitializedRef = isInitializedRef;
  }

  initialize(
    canvas: HTMLCanvasElement,
    setCanvasSize: (size: { width: number; height: number }) => void,
    initialSize: { width: number; height: number }
  ): void {
    if (this.isInitializedRef.current) return;

    canvas.width = initialSize.width;
    canvas.height = initialSize.height;

    const handleResize = (width: number, height: number) => {
      setCanvasSize({ width, height });
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    this.systemRef.current = new VectorParticleSystem(canvas, handleResize);
    this.isInitializedRef.current = true;
    paper.view.update();
  }

  setupAnimation(isPaused: boolean, settings: SimulationSettings): () => void {
    if (!this.systemRef.current) return () => {};

    if (paper.view) {
      paper.view.viewSize = new paper.Size(
        CANVAS_DIMENSIONS.WIDTH,
        CANVAS_DIMENSIONS.HEIGHT
      );
    }

    const animate = () => {
      if (!isPaused) {
        this.systemRef.current?.updateParticles(settings);
      }
      this.animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    paper.view.update();

    return () => {
      if (this.animationFrameRef.current) {
        cancelAnimationFrame(this.animationFrameRef.current);
      }
    };
  }

  updateColors(settings: SimulationSettings): void {
    if (this.systemRef.current) {
      this.systemRef.current.setColors(settings);
      this.systemRef.current.setBackgroundColor(settings.backgroundColor);
    }
  }

  cleanup(): void {
    if (this.animationFrameRef.current) {
      cancelAnimationFrame(this.animationFrameRef.current);
    }
    this.isInitializedRef.current = false;
  }

  setCursor(canvas: HTMLCanvasElement, tool: string): void {
    canvas.style.cursor = tool === "seed" ? "crosshair" : "default";
  }

  handleToolChange(tool: string): void {
    if (this.systemRef.current && tool !== "select") {
      this.systemRef.current.clearSelection();
    }
  }
}
