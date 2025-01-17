import { ParticleType, SimulationSettings } from '../types/particle';
import { ChemicalGridState } from '../types/chemical';

export class ChemicalDeposition {
  static depositChemicals(
    state: ChemicalGridState,
    particles: ParticleType[],
    settings: SimulationSettings,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { width, height, tempGrid } = state;
    tempGrid.set(state.grid);

    particles.forEach(particle => {
      const gridX = Math.floor((particle.x / canvasWidth) * width);
      const gridY = Math.floor((particle.y / canvasHeight) * height);
      
      const trailSize = Math.max(1, Math.floor(settings.chemicalDeposit * (width / canvasWidth)));
      
      if (trailSize < 2) {
        if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
          tempGrid[gridY * width + gridX] = 1;
        }
      } else {
        const radius = Math.max(1, trailSize / 2);
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const px = Math.floor(gridX + dx);
            const py = Math.floor(gridY + dy);
            
            if (dx * dx + dy * dy <= radius * radius && 
                px >= 0 && px < width && py >= 0 && py < height) {
              tempGrid[py * width + px] = 1;
            }
          }
        }
      }
    });
  }
}