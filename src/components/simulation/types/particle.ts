
export type ParticleState = 'active' | 'frozen' | 'stopped';

export interface ParticleData {
  velocity: paper.Point;
  createdAt: number;
  state: ParticleState;
  externalForceAngleOffset?: number;
  bounceCooldown?: number;
}

export interface FlockingForces {
  separation: paper.Point;
  cohesion: paper.Point;
  alignment: paper.Point;
}