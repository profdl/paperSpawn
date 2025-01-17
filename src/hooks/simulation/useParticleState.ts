import { useCallback, useRef } from 'react';
import { ParticleType, SpawnPattern, SimulationSettings } from '../../types/particle';
import { ParticleSystem } from '../../systems/ParticleSystem';

export function useParticleState() {
  const particlesRef = useRef<ParticleType[]>([]);

  const initializeParticles = useCallback((width: number, height: number, settings: SimulationSettings) => {
    particlesRef.current = ParticleSystem.createParticles(
      settings.count,
      width,
      height,
      settings.spawnPattern
    );
  }, []);

  const adjustParticleCount = useCallback((count: number, width: number, height: number, spawnPattern: SpawnPattern) => {
    const currentCount = particlesRef.current.length;
    
    if (count > currentCount) {
      const newParticles = ParticleSystem.createParticles(
        count - currentCount,
        width,
        height,
        spawnPattern
      );
      particlesRef.current = [...particlesRef.current, ...newParticles];
    } else if (count < currentCount) {
      particlesRef.current = particlesRef.current.slice(0, count);
    }
  }, []);

  const clearParticles = useCallback(() => {
    particlesRef.current = [];
  }, []);

  return {
    particles: particlesRef,
    initializeParticles,
    adjustParticleCount,
    clearParticles
  };
}