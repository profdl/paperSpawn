export type ParticleState = 'active' | 'frozen' | 'stopped';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  state: ParticleState;
  createdAt: number;
  externalForceAngleOffset?: number;
  bounceCooldown?: number;
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
  };
}

export interface SimulationSettings {
  externalForceAngle?: number;
  externalForceAngleRandomize?: number;
  externalForceStrength?: number;
  separationStrength?: number;
  cohesionStrength?: number;
  alignmentStrength?: number; 
  flockingRadius?: number;
  maxSpeed?: number;
  friction?: number;
  particleLifetime?: number;
  bounce?: boolean;
  wrap?: boolean;
}