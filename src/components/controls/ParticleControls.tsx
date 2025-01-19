import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../ui/DraggableNumberInput';

export default function ParticleControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Basic Properties
        </div>
        <div className="space-y-1.5">
         
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Speed</label>
            <DraggableNumberInput
              value={settings.speed}
              onChange={(value) => updateSetting('speed', value)}
              min={0}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Turn Rate</label>
            <DraggableNumberInput
              value={settings.turnRate}
              onChange={(value) => updateSetting('turnRate', value)}
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
          Wander Behavior
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Enable</label>
            <input
              type="checkbox"
              checked={settings.wanderEnabled}
              onChange={(e) => updateSetting('wanderEnabled', e.target.checked)}
              className="ml-2"
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Strength</label>
            <DraggableNumberInput
              value={settings.wanderStrength}
              onChange={(value) => updateSetting('wanderStrength', value)}
              min={0}
              max={5} // Increased from 1 to 5 for stronger effect
              step={0.1}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Speed</label>
            <DraggableNumberInput
              value={settings.wanderSpeed}
              onChange={(value) => updateSetting('wanderSpeed', value)}
              min={0}
              max={2}
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
              max={100}
              step={1}
              formatValue={(v) => `${v}px`}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Timing
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Active Time</label>
            <DraggableNumberInput
              value={settings.activeStateDuration}
              onChange={(value) => updateSetting('activeStateDuration', value)}
              min={0}
              max={8000}
              step={100}
              formatValue={(v) => `${v}ms`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Fade Time</label>
            <DraggableNumberInput
              value={settings.freezingDuration}
              onChange={(value) => updateSetting('freezingDuration', value)}
              min={0}
              max={3000}
              step={100}
              formatValue={(v) => `${v}ms`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Persistence</label>
            <DraggableNumberInput
              value={settings.trailPersistence}
              onChange={(value) => updateSetting('trailPersistence', value)}
              min={0}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}