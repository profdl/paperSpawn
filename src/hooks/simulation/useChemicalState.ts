import { useRef, useCallback } from 'react';
import { ChemicalGridState } from '../../types/chemical';
import { ChemicalSystem } from '../../systems/ChemicalSystem';

export function useChemicalState() {
  const gridStateRef = useRef<ChemicalGridState>();

  const initializeGrid = useCallback((width: number, height: number) => {
    if (!gridStateRef.current) {
      gridStateRef.current = ChemicalSystem.createGrid(width, height);
    } else {
      gridStateRef.current = ChemicalSystem.resizeGrid(gridStateRef.current, width, height);
    }
  }, []);

  const clearGrid = useCallback(() => {
    if (gridStateRef.current) {
      ChemicalSystem.clearGrid(gridStateRef.current);
    }
  }, []);

  return {
    gridState: gridStateRef,
    initializeGrid,
    clearGrid
  };
}