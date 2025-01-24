import paper from 'paper';

export class CanvasManager {
  private project: paper.Project;
  private onResizeCallback?: (width: number, height: number) => void;

  constructor(canvas: HTMLCanvasElement, onResize?: (width: number, height: number) => void) {
    this.onResizeCallback = onResize;
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(500, 400);
    this.project = paper.project;
  }

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
