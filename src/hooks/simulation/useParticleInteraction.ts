import { useCallback } from 'react';
import { ParticleSystem } from '../../systems/ParticleSystem';

export function useParticleInteraction(particlesRef: React.MutableRefObject<any[]>) {
  const addParticle = useCallback((x: number, y: number) => {
    const newParticle = ParticleSystem.createParticle(x, y);
    particlesRef.current.push(newParticle);
  }, [particlesRef]);

  const removeParticlesNear = useCallback((x: number, y: number, radius: number) => {
    particlesRef.current = particlesRef.current.filter(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) > radius;
    });
  }, [particlesRef]);

  return {
    addParticle,
    removeParticlesNear
  };
}