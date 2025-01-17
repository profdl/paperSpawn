import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../DraggableNumberInput';

export default function BehaviorControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Interaction Strengths
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Separation</label>
            <DraggableNumberInput
              value={settings.separation}
              onChange={(value) => updateSetting('separation', value)}
              min={0}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Cohesion</label>
            <DraggableNumberInput
              value={settings.cohesion}
              onChange={(value) => updateSetting('cohesion', value)}
              min={0}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Alignment</label>
            <DraggableNumberInput
              value={settings.alignment}
              onChange={(value) => updateSetting('alignment', value)}
              min={0}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Sensor Settings
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Angle</label>
            <DraggableNumberInput
              value={settings.sensorAngle}
              onChange={(value) => updateSetting('sensorAngle', value)}
              min={0}
              max={180}
              step={1}
              formatValue={(v) => `${v}°`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Distance</label>
            <DraggableNumberInput
              value={settings.sensorDistance}
              onChange={(value) => {
                updateSetting('sensorDistance', value);
                updateSetting('separationDistance', value);
                updateSetting('cohesionDistance', value * 4);
                updateSetting('alignmentDistance', value * 3);
              }}
              min={1}
              max={50}
              step={1}
              formatValue={(v) => `${v}px`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}