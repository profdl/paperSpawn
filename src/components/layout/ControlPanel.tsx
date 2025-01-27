import { useState } from 'react';
import AccordionSection from '../shared/AccordionSection';
import ParticleControls from '../controls/ParticleControls';
import BehaviorControls from '../controls/BehaviorControls';


export default function ControlPanel() {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['particles', 'behaviors', 'canvas-behaviors'])
  );
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
    <div className="border-2 border-neutral-900  fixed right-0 top-10 bottom-[100px] w-[260px] bg-black/70 text-white font-mono text-xs overflow-y-auto overflow-x-hidden  mr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="divide-y divide-white/10">
        <AccordionSection
          title="Particle Settings"
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
      </div>
    </div>
  );
}