import { useState } from 'react';
import AccordionSection from './AccordionSection';
import ParticleControls from '../controls/ParticleControls';
import BehaviorControls from '../controls/BehaviorControls';
import SpawnControls from '../controls/SpawnControls';
import AppearanceControls from '../controls/AppearanceControls';
import CanvasBehaviorsControls from '../controls/ExternalForcesControls';

export default function ControlPanel() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['particles']));

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="fixed right-0 top-10 bottom-0 w-[260px] bg-black/70 text-white font-mono text-xs overflow-y-auto">
      <div className="divide-y divide-white/10">
        <AccordionSection
          title="Particles"
          isOpen={openSections.has('particles')}
          onToggle={() => toggleSection('particles')}
        >
          <ParticleControls />
        </AccordionSection>

        <AccordionSection
          title="Behaviors"
          isOpen={openSections.has('behaviors')}
          onToggle={() => toggleSection('behaviors')}
        >
          <BehaviorControls />
        </AccordionSection>

        <AccordionSection
          title="Canvas Behaviors"
          isOpen={openSections.has('canvas-behaviors')}
          onToggle={() => toggleSection('canvas-behaviors')}
        >
          <CanvasBehaviorsControls />
        </AccordionSection>

        <AccordionSection
          title="Spawn Properties"
          isOpen={openSections.has('spawn')}
          onToggle={() => toggleSection('spawn')}
        >
          <SpawnControls />
        </AccordionSection>

        <AccordionSection
          title="Appearance"
          isOpen={openSections.has('appearance')}
          onToggle={() => toggleSection('appearance')}
        >
          <AppearanceControls />
        </AccordionSection>
      </div>
    </div>
  );
}