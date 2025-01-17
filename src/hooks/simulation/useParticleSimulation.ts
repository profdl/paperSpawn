import { useParticleState } from './useParticleState';
import { useParticleInteraction } from './useParticleInteraction';
import { useParticleUpdate } from './useParticleUpdate';

export function useParticleSimulation() {
  const { particles, initializeParticles, adjustParticleCount, clearParticles } = useParticleState();
  const { addParticle, removeParticlesNear } = useParticleInteraction(particles);
  const { updateParticles } = useParticleUpdate(particles);

  return {
    particles,
    initializeParticles,
    adjustParticleCount,
    addParticle,
    removeParticlesNear,
    clearParticles,
    updateParticles
  };
}