export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
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
  };
}