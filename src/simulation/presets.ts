import { SimulationSettings, PresetType } from '../types';

const defaultSettings: Partial<SimulationSettings> = {
  backgroundColor: '#FFFFFF',
  particleColor: '#000000',
  trailColor: '#8b8680',
  boundaryBehavior: 'wrap-around',
  activeStateDuration: 5000,
  speed: 0.4,
  count: 100,
};

export const presets: Record<PresetType | string, SimulationSettings> = {
  // Default Settings
  start: {
    ...defaultSettings,
    // Core Particle Properties
    paintingModeEnabled: true,
    particleSize: 2,
    activeStateDuration: 1000,
    turnRate: 1,
    sensorAngle: 180,
    paintSpawnRate: 50,
    spawnPattern: 'scatter',
    
    // Flocking Behavior
    flockingEnabled: true,
    separation: 0.12,
    separationDistance: 25,
    cohesion: 0.1,
    cohesionDistance: 50,
    alignment: 0.12,
    alignmentDistance: 50,
    
    // Aggregation Properties
    aggregationEnabled: false,
    aggregationDistance: 25,
    aggregationSpacing: 10,
    aggregationLineColor: '#444444',
    aggregationMaxConnections: 6,
    
    // DLA Settings
    dlaEnabled: true,
    dlaSnapDistance: 6,
    dlaSnapSpacing: 6,
    
    // Magnetism Settings
    magnetismEnabled: false,
    magnetismStrength: 1,
    magnetismDistance: 150,
    magnetismAngle: 360,
    
    // Wandering Behavior
    wanderEnabled: false,
    wanderStrength: .03,
    wanderSpeed: 4,
    wanderRadius: 300,
    
    // External Forces
    externalForcesEnabled: true,
    externalForceAngle: 90,
    externalForceAngleRandomize: 180,
    externalForceStrength: 0.01,
    
    // Obstacle Avoidance
    avoidanceEnabled: true,
    avoidanceDistance: 50,
    avoidanceStrength: 1,
    avoidancePushMultiplier: 2,
    bounceEnergy: 1,
    sensorDistance: 30,

    // Color Force
    bgColorForceEnabled: false,
    bgColorForceStrength: 1,
    bgColorForceAngleMin: 15,
    bgColorForceAngleMax: 45,
    //Image Displacement
    bgColorDisplaceEnabled: true,
    bgColorDisplaceDistance: 10,
    bgColorDisplaceAngle: 20,
  
  } as SimulationSettings,
};

export type PresetName = keyof typeof presets;