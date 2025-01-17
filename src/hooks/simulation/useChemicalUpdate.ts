import { useCallback } from 'react';
import { ParticleType, SimulationSettings } from '../../types/particle';
import { ChemicalGridState } from '../../types/chemical';
import { ChemicalSystem } from '../../systems/ChemicalSystem';

export function useChemicalUpdate(gridStateRef: React.MutableRefObject<ChemicalGridState | undefined>) {
  const updateGrid = useCallback((
    particles: ParticleType[],
    settings: SimulationSettings,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (gridStateRef.current) {
      ChemicalSystem.update(gridStateRef.current, particles, settings, canvasWidth, canvasHeight);
    }
  }, [gridStateRef]);

  const renderGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (gridStateRef.current) {
      ChemicalSystem.render(gridStateRef.current, ctx, canvasWidth, canvasHeight);
    }
  }, [gridStateRef]);

  return {
    updateGrid,
    renderGrid
  };
}