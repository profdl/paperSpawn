import { SimulationSettings } from '../types/particle';
import { ChemicalGridState } from '../types/chemical';

export class ChemicalDiffusion {
  static applyDiffusionAndDecay(
    state: ChemicalGridState,
    settings: SimulationSettings
  ): void {
    const { width, height, grid, tempGrid } = state;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        let value = tempGrid[idx];

        if (settings.diffusionRate > 0) {
          let sum = 0;
          let count = 0;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                sum += tempGrid[ny * width + nx];
                count++;
              }
            }
          }

          value = value * (1 - settings.diffusionRate) + 
                 (sum / count) * settings.diffusionRate;
        }

        if (settings.decayRate > 0) {
          value *= (1 - settings.decayRate);
        }

        grid[idx] = value;
      }
    }
  }
}