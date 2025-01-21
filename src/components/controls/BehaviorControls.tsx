import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../ui/DraggableNumberInput';

export default function BehaviorControls() {
  const { settings, updateSetting } = useSimulation();

  return (
<div className="space-y-4">
  <div>
  <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
  Flocking
    </div>
    <div className="space-y-1.5">
      {/* Separation Controls */}
      <div>
        <div className="control">
          <label className="inline-block w-[80px] text-[10px] mb-1">Separation</label>
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
          <label className="inline-block w-[80px] text-[10px] "></label>
          <DraggableNumberInput
            value={settings.separationDistance}
            onChange={(value) => updateSetting('separationDistance', value)}
            min={1}
            max={100}
            step={1}
            formatValue={(v) => `${v}px`}
          />
        </div>
      </div>

      {/* Cohesion Controls */}
      <div>
        <div className="control">
          <label className="inline-block w-[80px] text-[10px] mb-1">Cohesion</label>
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
          <label className="inline-block w-[80px] text-[10px]"></label>
          <DraggableNumberInput
            value={settings.cohesionDistance}
            onChange={(value) => updateSetting('cohesionDistance', value)}
            min={1}
            max={200}
            step={1}
            formatValue={(v) => `${v}px`}
          />
        </div>
      </div>

      {/* Alignment Controls */}
      <div>
        <div className="control">
          <label className="inline-block w-[80px] text-[10px] mb-1">Alignment</label>
          <DraggableNumberInput
            value={settings.alignment}
            onChange={(value) => updateSetting('alignment', value)}
            min={0}
            max={1}
            step={0.01}
            formatValue={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
        <div className="control">
          <label className="inline-block w-[80px] text-[10px]"></label>
          <DraggableNumberInput
            value={settings.alignmentDistance}
            onChange={(value) => updateSetting('alignmentDistance', value)}
            min={1}
            max={150}
            step={1}
            formatValue={(v) => `${v}px`}
          />
        </div>
      </div>
    </div>
  </div>



      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Wander
        </div>
        <div className="space-y-1.5">

          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Strength</label>
            <DraggableNumberInput
              value={settings.wanderStrength}
              onChange={(value) => updateSetting('wanderStrength', value)}
              min={0}
              max={3} 
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Speed</label>
            <DraggableNumberInput
              value={settings.wanderSpeed}
              onChange={(value) => updateSetting('wanderSpeed', value)}
              min={0}
              max={4}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Radius</label>
            <DraggableNumberInput
              value={settings.wanderRadius}
              onChange={(value) => updateSetting('wanderRadius', value)}
              min={0}
              max={300}
              step={1}
              formatValue={(v) => `${v}px`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}