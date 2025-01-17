import { ParticleType as BaseParticleType } from './baseTypes';

export interface ParticleType extends BaseParticleType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  sensorAngle: number;
  sensorDistance: number;
  state: 'active' | 'freezing' | 'frozen';
  createdAt: number;
  opacity: number;
  wanderAngle?: number; // New field for wander behavior
}

export type SpawnPattern = 'scatter' | 'grid' | 'circle' | 'point';
export type BoundaryBehavior = 'travel-off' | 'wrap-around' | 'bounce' | 'stop';

export interface SimulationSettings {
  count: number;
  particleSize: number;
  speed: number;
  flockingEnabled: boolean;
  separation: number;
  cohesion: number;
  alignment: number;
  separationDistance: number;
  cohesionDistance: number;
  alignmentDistance: number;
  slimeBehavior: boolean;
  sensorAngle: number;
  sensorDistance: number;
  turnRate: number;
  spawnPattern: SpawnPattern;
  backgroundColor: string;
  particleColor: string;
  trailColor: string;
  chemicalDeposit: number;
  diffusionRate: number;
  decayRate: number;
  paintingModeEnabled: boolean;
  activeStateDuration: number;
  freezingDuration: number;
  trailPersistence: number;
  externalForceAngle: number;
  externalForceStrength: number;
  boundaryBehavior: BoundaryBehavior;
  // New wander behavior settings
  wanderEnabled: boolean;
  wanderStrength: number;
  wanderSpeed: number;
  wanderRadius: number;
}

export type PresetType = 'fish' | 'slime' | 'hybrid';

export const presets: Record<PresetType, SimulationSettings> = {
  fish: {
    count: 0,
    particleSize: 2.5,
    speed: 0.40,
    flockingEnabled: true,
    separation: 0.15,
    cohesion: 1,
    alignment: 1,
    separationDistance: 20,
    cohesionDistance: 80,
    alignmentDistance: 60,
    slimeBehavior: true,
    sensorAngle: 40,
    sensorDistance: 20,
    turnRate: 1,
    spawnPattern: 'scatter',
    backgroundColor: '#FFFFFF',
    particleColor: '#000000',
    trailColor: '#8b8680',
    chemicalDeposit: 0.5,
    diffusionRate: 0,
    decayRate: 0,
    paintingModeEnabled: true,
    activeStateDuration: 1100,
    freezingDuration: 1000,
    trailPersistence: 1.0,
    externalForceAngle: 0,
    externalForceStrength: 0,
    boundaryBehavior: 'wrap-around',
    wanderEnabled: false,
    wanderStrength: 0.5,
    wanderSpeed: 1.0,
    wanderRadius: 50
  },
  slime: {
    count: 0,
    particleSize: 1,
    speed: 0.46,
    flockingEnabled: false,
    separation: 0.5,
    cohesion: 0.5,
    alignment: 0.5,
    separationDistance: 20,
    cohesionDistance: 50,
    alignmentDistance: 50,
    slimeBehavior: true,
    sensorAngle: 29,
    sensorDistance: 13,
    turnRate: 0.08,
    spawnPattern: 'grid',
    backgroundColor: '#FFFFFF',
    particleColor: '#000000',
    trailColor: '#8b8680',
    chemicalDeposit: 0.8,
    diffusionRate: 0,
    decayRate: 0,
    paintingModeEnabled: true,
    activeStateDuration: 2000,
    freezingDuration: 1000,
    trailPersistence: 1.0,
    externalForceAngle: 0,
    externalForceStrength: 0,
    boundaryBehavior: 'wrap-around',
    wanderEnabled: false,
    wanderStrength: 0.5,
    wanderSpeed: 1.0,
    wanderRadius: 50
  },
  hybrid: {
    count: 0,
    particleSize: 1,
    speed: 0.21,
    flockingEnabled: true,
    separation: 0.17,
    cohesion: 1.0,
    alignment: 0.42,
    separationDistance: 40,
    cohesionDistance: 90,
    alignmentDistance: 80,
    slimeBehavior: true,
    sensorAngle: 16,
    sensorDistance: 28,
    turnRate: 0.01,
    spawnPattern: 'circle',
    backgroundColor: '#FFFFFF',
    particleColor: '#000000',
    trailColor: '#8b8680',
    chemicalDeposit: 0.6,
    diffusionRate: 0,
    decayRate: 0,
    paintingModeEnabled: true,
    activeStateDuration: 2000,
    freezingDuration: 1000,
    trailPersistence: 1.0,
    externalForceAngle: 0,
    externalForceStrength: 0,
    boundaryBehavior: 'wrap-around',
    wanderEnabled: false,
    wanderStrength: 0.5,
    wanderSpeed: 1.0,
    wanderRadius: 50
  }
};