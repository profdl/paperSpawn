import { ChemicalGridState } from '../types/chemical';
import { SimulationSettings } from '../types/particle';

export class ChemicalRenderer {
  static render(
    state: ChemicalGridState,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    settings: SimulationSettings
  ): void {
    const { width, height, grid } = state;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set background color
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const imageData = tempCtx.createImageData(width, height);
    const data = imageData.data;

    // Parse trail color
    const trailColor = this.parseColor(settings.trailColor);

    for (let i = 0; i < grid.length; i++) {
      const value = grid[i];
      const idx = i * 4;
      data[idx] = trailColor.r;     // R
      data[idx + 1] = trailColor.g; // G
      data[idx + 2] = trailColor.b; // B
      data[idx + 3] = value * 255;  // A
    }

    tempCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
  }

  private static parseColor(color: string): { r: number; g: number; b: number } {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
}