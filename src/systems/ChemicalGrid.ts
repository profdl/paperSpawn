import { ParticleType, SimulationSettings } from '../types/particle';
import { ChemicalGridState } from '../types/chemical';

export class ChemicalGrid {
  static createGrid(width: number, height: number): ChemicalGridState {
    return {
      grid: new Float32Array(width * height),
      tempGrid: new Float32Array(width * height),
      width,
      height
    };
  }

  static resizeGrid(state: ChemicalGridState, newWidth: number, newHeight: number): ChemicalGridState {
    const newGrid = new Float32Array(newWidth * newHeight);
    const newTempGrid = new Float32Array(newWidth * newHeight);
    
    // Copy values from old grid to new grid, scaling to fit new dimensions
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const oldX = Math.floor((x / newWidth) * state.width);
        const oldY = Math.floor((y / newHeight) * state.height);
        newGrid[y * newWidth + x] = state.grid[oldY * state.width + oldX];
      }
    }
    
    return {
      grid: newGrid,
      tempGrid: newTempGrid,
      width: newWidth,
      height: newHeight
    };
  }

  static clearGrid(state: ChemicalGridState): void {
    state.grid.fill(0);
    state.tempGrid.fill(0);
  }

  static eraseArea(state: ChemicalGridState, x: number, y: number, radius: number): void {
    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(state.width - 1, Math.floor(x + radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const endY = Math.min(state.height - 1, Math.floor(y + radius));
    const radiusSquared = radius * radius;

    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= radiusSquared) {
          state.grid[py * state.width + px] = 0;
        }
      }
    }
  }
}