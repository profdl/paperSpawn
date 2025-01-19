import paper from 'paper';

export class CanvasBackground {
  private background: paper.Path.Rectangle;

  constructor(bounds: paper.Rectangle) {
    this.background = new paper.Path.Rectangle({
      rectangle: bounds,
      fillColor: 'white'
    });
    this.background.sendToBack();
  }

  setColor(color: string): void {
    this.background.fillColor = new paper.Color(color);
  }
}
