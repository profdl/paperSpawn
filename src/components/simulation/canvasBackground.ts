import paper from 'paper';

export class CanvasBackground {
  private background: paper.Path.Rectangle;
  private backgroundImage: paper.Raster | null = null;
  private onCanvasResize?: (width: number, height: number) => void;

  constructor(bounds: paper.Rectangle, onCanvasResize?: (width: number, height: number) => void) {
    this.background = new paper.Path.Rectangle({
      rectangle: bounds,
      fillColor: 'white'
    });
    this.background.sendToBack();
    this.onCanvasResize = onCanvasResize;
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

    // Once the image is loaded, resize canvas and scale image
    this.backgroundImage.onLoad = () => {
      // Get the image dimensions
      const imageWidth = this.backgroundImage!.width;
      const imageHeight = this.backgroundImage!.height;

      // Resize the canvas to match image dimensions
      if (this.onCanvasResize) {
        this.onCanvasResize(imageWidth, imageHeight);
      }

      // Update view bounds
      paper.view.viewSize = new paper.Size(imageWidth, imageHeight);
      
      // Update background rectangle
      this.background.remove();
      this.background = new paper.Path.Rectangle({
        rectangle: paper.view.bounds,
        fillColor: this.background.fillColor
      });

      // Position the image
      this.backgroundImage!.position = paper.view.center;
      this.backgroundImage!.opacity = 1;
      this.backgroundImage!.sendToBack();
      this.background.sendToBack();
      
      paper.view.update();
    };
  }
}
