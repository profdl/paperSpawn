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
      // Scale image to fit canvas while maintaining aspect ratio
      const viewBounds = paper.view.bounds;
      const scale = Math.min(
        viewBounds.width / this.backgroundImage!.width,
        viewBounds.height / this.backgroundImage!.height
      );
      
      this.backgroundImage!.scale(scale);
      this.backgroundImage!.position = paper.view.center;
      
      // Ensure proper layering
      this.backgroundImage!.sendToBack();
      this.background.sendToBack();  // Send the background rectangle behind the image
      
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

  getBackgroundImage(): paper.Raster | null {
    return this.backgroundImage;
  }
}
