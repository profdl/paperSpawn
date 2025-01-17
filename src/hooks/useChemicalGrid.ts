import { useRef, useCallback } from 'react';
import { SimulationSettings } from '../types/particle';
import type { ParticleType } from '../types/particle';
import { useQuality } from '../contexts/QualityContext';

export function useChemicalGrid() {
  const chemicalGridRef = useRef<Float32Array>();
  const gridWidthRef = useRef<number>(0);
  const gridHeightRef = useRef<number>(0);
  const tempGridRef = useRef<Float32Array>();
  const { getScaleFactor } = useQuality();

  const initializeGrid = useCallback((width: number, height: number) => {
    const scaleFactor = getScaleFactor();
    const gridWidth = width * scaleFactor;
    const gridHeight = height * scaleFactor;
    
    // Only initialize if dimensions have changed
    if (gridWidth !== gridWidthRef.current || gridHeight !== gridHeightRef.current) {
      gridWidthRef.current = gridWidth;
      gridHeightRef.current = gridHeight;
      
      // Create new grid with new dimensions
      const newGrid = new Float32Array(gridWidth * gridHeight);
      
      // If we had a previous grid, copy its contents to preserve trails
      if (chemicalGridRef.current) {
        const oldWidth = gridWidthRef.current;
        const oldHeight = gridHeightRef.current;
        
        // Copy values from old grid to new grid, scaling to fit new dimensions
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const oldX = Math.floor((x / gridWidth) * oldWidth);
            const oldY = Math.floor((y / gridHeight) * oldHeight);
            newGrid[y * gridWidth + x] = chemicalGridRef.current[oldY * oldWidth + oldX];
          }
        }
      }
      
      chemicalGridRef.current = newGrid;
      tempGridRef.current = new Float32Array(gridWidth * gridHeight);
    }
  }, [getScaleFactor]);

  const clearGrid = useCallback(() => {
    if (chemicalGridRef.current) {
      chemicalGridRef.current.fill(0);
    }
  }, []);

  const eraseGridArea = useCallback((x: number, y: number, radius: number) => {
    if (!chemicalGridRef.current) return;

    const scaleFactor = getScaleFactor();
    const width = gridWidthRef.current;
    const height = gridHeightRef.current;
    const grid = chemicalGridRef.current;

    x *= scaleFactor;
    y *= scaleFactor;
    radius *= scaleFactor;

    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(width - 1, Math.floor(x + radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const endY = Math.min(height - 1, Math.floor(y + radius));
    const radiusSquared = radius * radius;

    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= radiusSquared) {
          grid[py * width + px] = 0;
        }
      }
    }
  }, [getScaleFactor]);

  const updateGrid = useCallback((
    particles: ParticleType[],
    settings: SimulationSettings,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!chemicalGridRef.current || !tempGridRef.current) return;

    const scaleFactor = getScaleFactor();
    const width = gridWidthRef.current;
    const height = gridHeightRef.current;
    const grid = chemicalGridRef.current;
    const tempGrid = tempGridRef.current;

    // Copy current grid to temp grid
    tempGrid.set(grid);

    // Deposit chemicals
    particles.forEach(particle => {
      const gridX = Math.floor((particle.x / canvasWidth) * width);
      const gridY = Math.floor((particle.y / canvasHeight) * height);
      
      const trailSize = Math.max(1, Math.floor(settings.chemicalDeposit * scaleFactor));
      
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

    // Apply diffusion and decay
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
  }, [getScaleFactor]);

  const renderGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    settings: SimulationSettings
  ) => {
    if (!chemicalGridRef.current) return;

    const width = gridWidthRef.current;
    const height = gridHeightRef.current;
    const grid = chemicalGridRef.current;

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
    const trailColor = {
      r: parseInt(settings.trailColor.slice(1, 3), 16),
      g: parseInt(settings.trailColor.slice(3, 5), 16),
      b: parseInt(settings.trailColor.slice(5, 7), 16)
    };

    for (let i = 0; i < grid.length; i++) {
      const value = grid[i];
      const idx = i * 4;
      data[idx] = trailColor.r;     // R
      data[idx + 1] = trailColor.g; // G
      data[idx + 2] = trailColor.b; // B
      data[idx + 3] = value * 255;  // A
    }

    tempCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, canvasWidth, canvasHeight);
  }, []);

  return {
    gridWidth: gridWidthRef,
    gridHeight: gridHeightRef,
    initializeGrid,
    clearGrid,
    eraseGridArea,
    updateGrid,
    renderGrid
  };
}