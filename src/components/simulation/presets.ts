import { SimulationSettings, PresetType } from '../../types';

const defaultSettings: Partial<SimulationSettings> = {
  paintSpawnRate: 50,
  count: 100,
  particleSize: 2,
  speed: 0.75,
  backgroundColor: '#FFFFFF',
  particleColor: '#000000',
  trailColor: '#8b8680',
  boundaryBehavior: 'wrap-around',
  paintingModeEnabled: true,
  activeStateDuration: 10000,
  freezingDuration: 1000,
};

export const presets: Record<PresetType | string, SimulationSettings> = {
  // Original start preset
  start: {
    ...defaultSettings,
    flockingEnabled: false,
    externalForcesEnabled: true,
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
    externalForceAngle: 90,
    externalForceAngleRandomize: 45,
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
    magnetismEnabled: true,
    magnetismStrength: 1,
    magnetismDistance: 150,
    magnetismAngle: 360,
    aggregationEnabled: false,
    aggregationDistance: 10,
    aggregationLineColor: '#444444'
  } as SimulationSettings,

  // Magnetic chain formation preset
  magneticChains: {
    ...defaultSettings,
    count: 100,
    speed: 2,
    particleSize: 4,
    boundaryBehavior: 'reflect',
    backgroundColor: '#000000',
    particleColor: '#4287f5',
    trailColor: '#2C5530',
    magnetismEnabled: true,
    magnetismStrength: 0.7,
    magnetismDistance: 150,
    magnetismAngle: 0,
    magneticFieldStrength: 1.2,
    magneticMinDistance: 15,
    showMagneticField: true,
    magneticPolarityEnabled: true,
    flockingEnabled: false,
    wanderEnabled: false,
    externalForcesEnabled: false
  } as SimulationSettings,

  // Magnetic clusters preset
  magneticClusters: {
    ...defaultSettings,
    count: 200,
    speed: 1.5,
    particleSize: 3,
    boundaryBehavior: 'wrap-around',
    backgroundColor: '#1a1a1a',
    particleColor: '#ff3838',
    trailColor: '#0099ff',
    magnetismEnabled: true,
    magnetismStrength: 0.9,
    magnetismDistance: 80,
    magnetismAngle: 45,
    magneticFieldStrength: 1.5,
    magneticMinDistance: 8,
    showMagneticField: true,
    magneticPolarityEnabled: true,
    flockingEnabled: false,
    wanderEnabled: false,
    externalForcesEnabled: false
  } as SimulationSettings,

  // Magnetic waves preset
  magneticWaves: {
    ...defaultSettings,
    count: 150,
    speed: 3,
    particleSize: 5,
    boundaryBehavior: 'reflect',
    backgroundColor: '#000C14',
    particleColor: '#CCFBFF',
    trailColor: '#39FF14',
    magnetismEnabled: true,
    magnetismStrength: 0.6,
    magnetismDistance: 200,
    magnetismAngle: 90,
    magneticFieldStrength: 0.8,
    magneticMinDistance: 20,
    showMagneticField: true,
    magneticPolarityEnabled: true,
    wanderEnabled: true,
    wanderStrength: 0.3,
    flockingEnabled: false,
    externalForcesEnabled: false
  } as SimulationSettings,

  // Magnetic field lines preset
  magneticFields: {
    ...defaultSettings,
    count: 120,
    speed: 2.5,
    particleSize: 3,
    boundaryBehavior: 'wrap-around',
    backgroundColor: '#2A0134',
    particleColor: '#9B4DCA',
    trailColor: '#D1A7E8',
    magnetismEnabled: true,
    magnetismStrength: 0.8,
    magnetismDistance: 175,
    magnetismAngle: 180,
    magneticFieldStrength: 1.3,
    magneticMinDistance: 12,
    showMagneticField: true,
    magneticPolarityEnabled: true,
    paintingModeEnabled: true,
    trailPersistence: 0.8,
    flockingEnabled: false,
    wanderEnabled: true,
    wanderStrength: 0.2,
    externalForcesEnabled: false
  } as SimulationSettings,
};

export type PresetName = keyof typeof presets;