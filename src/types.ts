export type SpawnPattern = 'scatter' | 'grid' | 'circle' | 'point';
export type BoundaryBehavior = 'travel-off' | 'wrap-around' | 'reflect' | 'stop';
export type ParticleState = 'active' | 'frozen' | 'stopped';

export interface ParticleProperties {
  velocity: paper.Point;
  position: paper.Point;
  radius: number;
}

export interface TransformableItem {
  bounds: paper.Rectangle;
  position: paper.Point;
  rotation: number;
}

export interface ParticleData {
  velocity: paper.Point;
  createdAt: number;
  state: ParticleState;
  externalForceAngleOffset?: number;
  bounceCooldown?: number;
  aggregatedWith?: Set<number>;
  aggregationLines?: paper.Path[];
  isAggregationLeader?: boolean;
}


// interface for magnetic field visualization
export interface MagneticFieldProperties {
  visible: boolean;
  density: number;
  lineLength: number;
  lineOpacity: number;
  lineColor: string;
}


export interface FlockingForces {
  separation: paper.Point;
  cohesion: paper.Point;
  alignment: paper.Point;
}

export interface ParticlePreset {
  id?: string;
  name: string;
  userId?: string;
  parameters: {
    particleCount: number;
    particleLife: number;
    particleSize: number;
    particleSpeed: number;
    particleSpread: number;
    particleColor: string;
    particleShape: string;
    externalForceAngle?: number;
    externalForceAngleRandomize?: number;
    externalForceStrength?: number;
    separationStrength?: number;
    cohesionStrength?: number;
    alignmentStrength?: number;
    flockingRadius?: number;
    maxSpeed?: number;
    friction?: number;
    bounce?: boolean;
    wrap?: boolean;
    magnetismEnabled?: boolean;
    magnetismStrength?: number;
    magnetismDistance?: number;
    magneticFieldStrength?: number;
    magneticMinDistance?: number;
    showMagneticField?: boolean;
    magneticPolarityEnabled?: boolean;
    aggregationEnabled: boolean;
    aggregationDistance: number; 
  };
}

export interface SimulationSettings {
  paintSpawnRate: number;
  count: number;
  particleSize: number;
  speed: number;
  flockingEnabled: boolean;
  externalForcesEnabled: boolean;
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
  wanderEnabled: boolean;
  wanderSpeed: number;
  wanderRadius: number;
  wanderStrength: number;
  avoidanceEnabled: boolean;
  avoidanceDistance: number;
  avoidanceStrength: number;
  avoidancePushMultiplier: number;
  bounceEnergy: number;
  magnetismEnabled: boolean;
  magnetismStrength: number;
  magnetismDistance: number;
  magneticFieldStrength: number;    
  magneticMinDistance: number;      
  showMagneticField: boolean;       
  magneticPolarityEnabled: boolean; 
  particleLifetime?: number;
  maxSpeed?: number;
  friction?: number;
  aggregationEnabled: boolean;
  aggregationDistance: number;
  aggregationLineColor: string;
}

export type PresetType = 'start';

export interface EraserProperties {
  size: number;
  eraseParticles: boolean;
  eraseTrails: boolean;
}

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
    name: "Magnetic Field",
    background: "#000000",
    particle: "#4287f5",
    trail: "#2C5530"
  },
  {
    name: "Electromagnetic",
    background: "#1a1a1a",
    particle: "#ff3838",
    trail: "#0099ff"
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

export interface ColorScheme {
  name: string;
  background: string;
  particle: string;
  trail: string;
}
