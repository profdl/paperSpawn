import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { presets } from '../types/particle';
import { usePresets } from '../hooks/usePresets';
import { useAuth } from '../hooks/useAuth';
import AccordionSection from './AccordionSection';
import ParticleControls from './controls/ParticleControls';
import BehaviorControls from './controls/BehaviorControls';
import TrailControls from './controls/TrailControls';
import SpawnControls from './controls/SpawnControls';
import AppearanceControls from './controls/AppearanceControls';
import CanvasBehaviorsControls from './controls/ExternalForcesControls';
import PresetModal from './PresetModal';
import { useSimulation } from '../contexts/SimulationContext';

export default function ControlPanel() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['presets', 'particles']));
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { user } = useAuth();
  const { presets: savedPresets, savePreset, loadPreset } = usePresets();
  const { settings, updateSetting } = useSimulation();

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

  const handleSavePreset = async (name: string) => {
    try {
      await savePreset(name, settings);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
    }
  };

  const handlePresetChange = async (value: string) => {
    if (value.startsWith('custom:')) {
      try {
        const presetId = value.replace('custom:', '');
        const loadedSettings = await loadPreset(presetId);
        Object.entries(loadedSettings).forEach(([key, value]) => {
          updateSetting(key as keyof typeof settings, value);
        });
      } catch (error) {
        console.error('Failed to load preset:', error);
        alert('Failed to load preset. Please try again.');
      }
    } else {
      const presetSettings = presets[value as keyof typeof presets];
      Object.entries(presetSettings).forEach(([key, value]) => {
        updateSetting(key as keyof typeof settings, value);
      });
    }
  };

  const getCurrentPresetValue = () => {
    for (const [presetKey, presetValue] of Object.entries(presets)) {
      if (
        settings.speed === presetValue.speed &&
        settings.turnRate === presetValue.turnRate &&
        settings.separation === presetValue.separation &&
        settings.cohesion === presetValue.cohesion &&
        settings.alignment === presetValue.alignment &&
        settings.sensorAngle === presetValue.sensorAngle &&
        settings.sensorDistance === presetValue.sensorDistance
      ) {
        return presetKey;
      }
    }

    const matchingSavedPreset = savedPresets.find(preset => {
      const presetSettings = preset.property_values;
      return (
        settings.speed === presetSettings.speed &&
        settings.turnRate === presetSettings.turnRate &&
        settings.separation === presetSettings.separation &&
        settings.cohesion === presetSettings.cohesion &&
        settings.alignment === presetSettings.alignment &&
        settings.sensorAngle === presetSettings.sensorAngle &&
        settings.sensorDistance === presetSettings.sensorDistance
      );
    });

    return matchingSavedPreset ? `custom:${matchingSavedPreset.id}` : '';
  };

  return (
    <div className="fixed right-0 top-10 bottom-0 w-[260px] bg-black/70 text-white font-mono text-xs overflow-y-auto">
      <div className="divide-y divide-white/10">
        <AccordionSection
          title="Presets"
          isOpen={openSections.has('presets')}
          onToggle={() => toggleSection('presets')}
        >
          <div className="space-y-2">
            <div className="control">
              <select
                className="w-full bg-black/50 border border-white/20 rounded px-2 py-1"
                onChange={(e) => handlePresetChange(e.target.value)}
                value={getCurrentPresetValue()}
              >
                <optgroup label="Built-in Presets">
                  <option value="fish">School of Fish</option>
                  <option value="slime">Slime Mold</option>
                  <option value="hybrid">Hybrid Behavior</option>
                </optgroup>
                {user && savedPresets.length > 0 && (
                  <optgroup label="My Presets">
                    {savedPresets.map((preset) => (
                      <option key={preset.id} value={`custom:${preset.id}`}>
                        {preset.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            
            {user && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 rounded py-1 px-2 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save Current Settings
              </button>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Appearance"
          isOpen={openSections.has('appearance')}
          onToggle={() => toggleSection('appearance')}
        >
          <AppearanceControls />
        </AccordionSection>

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
          title="Trails"
          isOpen={openSections.has('trails')}
          onToggle={() => toggleSection('trails')}
        >
          <TrailControls />
        </AccordionSection>

        <AccordionSection
          title="Spawn Properties"
          isOpen={openSections.has('spawn')}
          onToggle={() => toggleSection('spawn')}
        >
          <SpawnControls />
        </AccordionSection>
      </div>

      <PresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePreset}
        existingNames={savedPresets.map(p => p.name)}
        mode="save"
      />
    </div>
  );
}