import { useCallback } from 'react';
import { SimulationSettings } from '../../types/particle';
import { ParticleSystem } from '../../systems/ParticleSystem';

export function useParticleUpdate(particlesRef: React.MutableRefObject<any[]>) {
  const updateParticles = useCallback((settings: SimulationSettings, width: number, height: number) => {
    particlesRef.current = ParticleSystem.updateParticles(
      particlesRef.current,
      settings,
      width,
      height
    );
  }, [particlesRef]);

  return {
    updateParticles
  };
}