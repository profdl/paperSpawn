import paper from 'paper';

export class CanvasBackground {
  private background: paper.Path.Rectangle;
  private backgroundImage: paper.Raster | null = null;

  constructor(bounds: paper.Rectangle) {
    this.background = new paper.Path.Rectangle({
      rectangle: bounds,
      fillColor: 'white'
    });
    this.background.sendToBack();
  }

  setColor(color: string): void {
    this.background.fillColor = new paper.Color(color);
    if (this.backgroundImage) {
      this.backgroundImage.opacity = 0.5; // Make image semi-transparent when color is set
    }
  }

  setImage(imageUrl: string): void {
    // Remove existing background image if any
    if (this.backgroundImage) {
      this.backgroundImage.remove();
    }

    // Create new raster from image URL
    this.backgroundImage = new paper.Raster({
      source: imageUrl,
      position: paper.view.center
    });

    // Once the image is loaded, scale it to fit the canvas
    this.backgroundImage.onLoad = () => {
      const bounds = paper.view.bounds;
      const scale = Math.min(
        bounds.width / this.backgroundImage!.width,
        bounds.height / this.backgroundImage!.height
      );

      this.backgroundImage!.scale(scale);
      this.backgroundImage!.position = paper.view.center;
      this.backgroundImage!.opacity = 1;
      this.backgroundImage!.sendToBack();
      this.background.sendToBack();
      
      paper.view.update();
    };
  }
}