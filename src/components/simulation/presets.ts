import { SimulationSettings, PresetType } from '../../types';

const defaultSettings: Partial<SimulationSettings> = {
  paintSpawnRate: 50,
  count: 100,
  particleSize: 2,
  speed: 0.75,
  backgroundColor: '#FFFFFF',
  particleColor: '#000000',
  trailColor: '#8b8680',
  boundaryBehavior: 'stop',
  paintingModeEnabled: false,
  activeStateDuration: 3000,
  freezingDuration: 1000,
};

export const presets: Record<PresetType | string, SimulationSettings> = {
  // Original start preset
  start: {
    ...defaultSettings,
    flockingEnabled: false,
    separation: 0.12,
    cohesion: 0.1,
    alignment: 0.12,
    separationDistance: 25,
    cohesionDistance: 50,
    alignmentDistance: 50,
    slimeBehavior: false,
    sensorAngle: 180,
    sensorDistance: 30,
    turnRate: 1,
    spawnPattern: 'scatter',
    chemicalDeposit: 1,
    diffusionRate: 1,
    decayRate: 0.1,
    trailPersistence: 1,
    externalForcesEnabled: true,
    externalForceAngle: 90,
    externalForceAngleRandomize: 180,
    externalForceStrength: 0.01,
    wanderEnabled: false,
    wanderSpeed: 1,
    wanderRadius: 25,
    wanderStrength: 0,
    avoidanceEnabled: false,
    avoidanceDistance: 50,
    avoidanceStrength: 1,
    avoidancePushMultiplier: 2,
    bounceEnergy: 1,
    magnetismEnabled: false,
    magnetismStrength: 1,
    magnetismDistance: 150,
    magnetismAngle: 360,
    aggregationEnabled: true,
    aggregationDistance: 25,
    aggregationLineColor: '#444444',
    aggregationSpacing: 10
  } as SimulationSettings,

 

};

export type PresetName = keyof typeof presets;