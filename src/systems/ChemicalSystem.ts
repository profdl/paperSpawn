import { ParticleType, SimulationSettings } from '../types/particle';
import { ChemicalGridState } from '../types/chemical';
import { ChemicalGrid } from './ChemicalGrid';
import { ChemicalDeposition } from './ChemicalDeposition';
import { ChemicalDiffusion } from './ChemicalDiffusion';
import { ChemicalRenderer } from './ChemicalRenderer';

export class ChemicalSystem {
  static createGrid(width: number, height: number): ChemicalGridState {
    return ChemicalGrid.createGrid(width, height);
  }

  static resizeGrid(state: ChemicalGridState, width: number, height: number): ChemicalGridState {
    return ChemicalGrid.resizeGrid(state, width, height);
  }

  static clearGrid(state: ChemicalGridState): void {
    ChemicalGrid.clearGrid(state);
  }

  static eraseArea(state: ChemicalGridState, x: number, y: number, radius: number): void {
    ChemicalGrid.eraseArea(state, x, y, radius);
  }

  static update(
    state: ChemicalGridState,
    particles: ParticleType[],
    settings: SimulationSettings,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    ChemicalDeposition.depositChemicals(state, particles, settings, canvasWidth, canvasHeight);
    ChemicalDiffusion.applyDiffusionAndDecay(state, settings);
  }

  static render(
    state: ChemicalGridState,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    settings: SimulationSettings
  ): void {
    ChemicalRenderer.render(state, ctx, canvasWidth, canvasHeight, settings);
  }
}