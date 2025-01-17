import { useCallback } from 'react';
import { ChemicalSystem } from '../../systems/ChemicalSystem';
import { ChemicalGridState } from '../../types/chemical';

export function useChemicalInteraction(gridStateRef: React.MutableRefObject<ChemicalGridState | undefined>) {
  const eraseGridArea = useCallback((x: number, y: number, radius: number) => {
    if (gridStateRef.current) {
      ChemicalSystem.eraseArea(gridStateRef.current, x, y, radius);
    }
  }, [gridStateRef]);

  return {
    eraseGridArea
  };
}