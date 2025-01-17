import { useRef, useCallback } from 'react';
import { ParticleType, SimulationSettings, SpawnPattern } from '../types/particle';
import { ParticleSystem } from '../systems/ParticleSystem';

export function useParticleSimulation() {
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

  const addParticle = useCallback((x: number, y: number) => {
    const newParticle = ParticleSystem.createParticle(x, y);
    particlesRef.current.push(newParticle);
  }, []);

  const removeParticlesNear = useCallback((x: number, y: number, radius: number) => {
    particlesRef.current = particlesRef.current.filter(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) > radius;
    });
  }, []);

  const clearParticles = useCallback(() => {
    particlesRef.current = [];
  }, []);

  const updateParticles = useCallback((settings: SimulationSettings, width: number, height: number) => {
    particlesRef.current = ParticleSystem.updateParticles(
      particlesRef.current,
      settings,
      width,
      height
    );
  }, []);

  return {
    particles: particlesRef,
    initializeParticles,
    adjustParticleCount,
    addParticle,
    removeParticlesNear,
    clearParticles,
    updateParticles
  };
}