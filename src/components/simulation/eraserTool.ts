import paper from 'paper';

export class EraserTool {
  private eraserCircle: paper.Path.Circle | null = null;

  showEraserCircle(x: number, y: number, radius: number): void {
    const position = new paper.Point(x, y);
    
    if (this.eraserCircle) {
      this.eraserCircle.position = position;
    } else {
      this.eraserCircle = new paper.Path.Circle({
        center: position,
        radius: radius,
        strokeColor: 'white',
        strokeWidth: 1,
        dashArray: [4, 4],
        opacity: 0.5
      });
    }
  }

  hideEraserCircle(): void {
    if (this.eraserCircle) {
      this.eraserCircle.remove();
      this.eraserCircle = null;
    }
  }
}
