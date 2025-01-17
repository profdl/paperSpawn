import { useChemicalState } from './useChemicalState';
import { useChemicalInteraction } from './useChemicalInteraction';
import { useChemicalUpdate } from './useChemicalUpdate';

export function useChemicalGrid() {
  const { gridState, initializeGrid, clearGrid } = useChemicalState();
  const { eraseGridArea } = useChemicalInteraction(gridState);
  const { updateGrid, renderGrid } = useChemicalUpdate(gridState);

  return {
    gridState,
    initializeGrid,
    clearGrid,
    eraseGridArea,
    updateGrid,
    renderGrid
  };
}