import paper from 'paper';
import { CANVAS_DIMENSIONS } from '../layout/constants';

export class CanvasManager {
  constructor(canvas: HTMLCanvasElement, onResize?: (width: number, height: number) => void) {
    this.onResizeCallback = onResize;
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT);
    this.project = paper.project;
  }
  
  private project: paper.Project;
  private onResizeCallback?: (width: number, height: number) => void;

  getViewDimensions(): { width: number; height: number } {
    return {
      width: paper.view.viewSize.width,
      height: paper.view.viewSize.height
    };
  }

  getCanvasDimensions(): { width: number; height: number } {
    const canvas = this.project.view.element as HTMLCanvasElement;
    return {
      width: canvas.width,
      height: canvas.height
    };
  }

  handleResize(width: number, height: number): void {
    paper.view.viewSize = new paper.Size(width, height);
    if (this.onResizeCallback) {
      this.onResizeCallback(width, height);
    }
  }

  getProject(): paper.Project {
    return this.project;
  }
}
