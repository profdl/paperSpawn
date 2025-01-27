import paper from 'paper';
import { CANVAS_DIMENSIONS } from '../../../components/layout/constants';

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
      // Calculate new dimensions based on fitting to canvas width
      const canvasWidth = CANVAS_DIMENSIONS.WIDTH;
      const imageAspectRatio = this.backgroundImage!.width / this.backgroundImage!.height;
      const newWidth = canvasWidth;
      const newHeight = Math.round(canvasWidth / imageAspectRatio); // Round to prevent fractional pixels
  
      // Scale the image to exactly match the new dimensions
      this.backgroundImage!.scaling = new paper.Point(newWidth / this.backgroundImage!.width, newWidth / this.backgroundImage!.width);
      
      // Important: Set BOTH view size and background rectangle to exactly match
      paper.view.viewSize = new paper.Size(newWidth, newHeight);
      
      // Ensure background rectangle exactly matches view bounds
      this.background.remove();
      this.background = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(0, 0, newWidth, newHeight),
        fillColor: this.background.fillColor
      });
  
      // Center everything precisely
      this.backgroundImage!.position = new paper.Point(newWidth / 2, newHeight / 2);
      
      // Call resize callback with exact dimensions
      if (this.onCanvasResize) {
        this.onCanvasResize(newWidth, newHeight);
      }
  
      // Style settings
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
