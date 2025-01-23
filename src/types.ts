


export type SpawnPattern = 'scatter' | 'grid' | 'circle' | 'point';
export type BoundaryBehavior = 'travel-off' | 'wrap-around' | 'reflect' | 'stop';

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
  externalForceAngleRandomize: number;
  externalForceStrength: number;
  boundaryBehavior: BoundaryBehavior;
  // New wander behavior settings
  wanderEnabled: boolean;
  wanderStrength: number;
  wanderSpeed: number;
  wanderRadius: number;
}

export type PresetType = 'start' ;

export interface EraserProperties {
  size: number;
  eraseParticles: boolean;
  eraseTrails: boolean;
}

export const presets: Record<PresetType, SimulationSettings> = {
  start: {
    count: 108,
    particleSize: 2.5,
    speed: 0.5,                  
    flockingEnabled: true,
    separation: 0,            
    cohesion: 0,             
    alignment: 0,              
    separationDistance: 20,
    cohesionDistance: 80,
    alignmentDistance: 60,
    slimeBehavior: true,
    sensorAngle: 120,
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
    externalForceAngle: 90,
    externalForceAngleRandomize: 0,
    externalForceStrength: 0.5,   
    boundaryBehavior: 'reflect',
    wanderEnabled: true,       
    wanderStrength: 0,        
    wanderSpeed: 1.0,
    wanderRadius: 50
  }
};

export interface ColorScheme {
    name: string;
    background: string;
    particle: string;
    trail: string;
  }

  export type Tool = 'none' | 'paint' | 'erase' | 'rectangle' | 'select' | 'freehand';
  
  export const colorSchemes: ColorScheme[] = [
    {
      name: "Classic",
      background: "#FFFFFF",
      particle: "#000000",
      trail: "#8b8680"
    },
    {
      name: "Neon",
      background: "#0D0221",
      particle: "#FF00FF",
      trail: "#00FF00"
    },
    {
      name: "Deep Sea",
      background: "#000C14",
      particle: "#00FFFF",
      trail: "#005C97"
    },
    {
      name: "Sakura",
      background: "#2D0320",
      particle: "#FFB7C5",
      trail: "#FF4D6D"
    },
    {
      name: "Emerald",
      background: "#004B49",
      particle: "#00FF9F",
      trail: "#98FF98"
    },
    {
      name: "Sunset",
      background: "#2B1B17",
      particle: "#FFA07A",
      trail: "#FF4500"
    },
    {
      name: "Arctic",
      background: "#FFFFFF",
      particle: "#87CEEB",
      trail: "#4169E1"
    },
    {
      name: "Volcanic",
      background: "#160101",
      particle: "#FF7F50",
      trail: "#8B0000"
    },
    {
      name: "Ethereal",
      background: "#2C003E",
      particle: "#FF61EF",
      trail: "#7B2FBE"
    },
    {
      name: "Desert",
      background: "#3C1518",
      particle: "#FFB347",
      trail: "#69140E"
    },
    {
      name: "Matrix",
      background: "#000000",
      particle: "#39FF14",
      trail: "#008F11"
    },
    {
      name: "Amethyst",
      background: "#2A0134",
      particle: "#9B4DCA",
      trail: "#D1A7E8"
    },
    {
      name: "Coral Reef",
      background: "#00384D",
      particle: "#FF7E67",
      trail: "#00A5CF"
    },
    {
      name: "Golden Hour",
      background: "#28282B",
      particle: "#FFD700",
      trail: "#FFA500"
    },
    {
      name: "Northern Lights",
      background: "#000C14",
      particle: "#CCFBFF",
      trail: "#39FF14"
    },
    {
      name: "Blood Moon",
      background: "#0A0000",
      particle: "#FF3333",
      trail: "#8B0000"
    }
  ];


  