import paper from 'paper';
import { CANVAS_DIMENSIONS } from '../layout/constants';

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
    if (this.backgroundImage) {
      this.backgroundImage.remove();
    }
  
    this.backgroundImage = new paper.Raster({
      source: imageUrl,
      position: paper.view.center
    });
  
    this.backgroundImage.onLoad = () => {
      const canvasWidth = CANVAS_DIMENSIONS.WIDTH; // Use constant width
      const imageAspectRatio = this.backgroundImage!.width / this.backgroundImage!.height;
      
      // Calculate new dimensions maintaining aspect ratio
      const newWidth = canvasWidth;
      const newHeight = canvasWidth / imageAspectRatio;
  
      // Scale the image
      const scale = newWidth / this.backgroundImage!.width;
      this.backgroundImage!.scale(scale);
  
      // Update view and canvas size
      if (this.onCanvasResize) {
        this.onCanvasResize(newWidth, newHeight);
      }
  
      // Update view bounds
      paper.view.viewSize = new paper.Size(newWidth, newHeight);
      
      // Update background rectangle
      this.background.remove();
      this.background = new paper.Path.Rectangle({
        rectangle: paper.view.bounds,
        fillColor: this.background.fillColor
      });
  
      // Center the image
      this.backgroundImage!.position = paper.view.center;
      this.backgroundImage!.opacity = 1;
      this.backgroundImage!.sendToBack();
      this.background.sendToBack();
      
      paper.view.update();
    };
  }

  removeBackgroundImage(): void {
    if (this.backgroundImage) {
      this.backgroundImage.remove();
      this.backgroundImage = null;
    }
    
    // Reset view to original dimensions if needed
    paper.view.viewSize = new paper.Size(500, 400); // or whatever your default size is
    
    // Update background rectangle
    this.background.remove();
    this.background = new paper.Path.Rectangle({
      rectangle: paper.view.bounds,
      fillColor: this.background.fillColor
    });
    
    paper.view.update();
  }
}
