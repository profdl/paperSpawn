import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../ui/DraggableNumberInput';
import { BoundaryBehavior } from '../../types';

export default function CanvasBehaviorsControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          External Forces
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Angle</label>
            <DraggableNumberInput
              value={settings.externalForceAngle}
              onChange={(value) => updateSetting('externalForceAngle', value)}
              min={0}
              max={360}
              step={1}
              formatValue={(v) => `${v}°`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Randomize</label>
            <DraggableNumberInput
              value={settings.externalForceAngleRandomize}
              onChange={(value) => updateSetting('externalForceAngleRandomize', value)}
              min={0}
              max={180}
              step={1}
              formatValue={(v) => `±${v}°`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Strength</label>
            <DraggableNumberInput
              value={settings.externalForceStrength}
              onChange={(value) => updateSetting('externalForceStrength', value)}
              min={0}
              max={2}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Boundary Behavior
        </div>
        <select
          className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs"
          value={settings.boundaryBehavior}
          onChange={(e) => updateSetting('boundaryBehavior', e.target.value as BoundaryBehavior)}
        >
          <option value="travel-off">Travel Off</option>
          <option value="wrap-around">Wrap Around</option>
          <option value="reflect">Reflect</option>
          <option value="stop">Stop</option>
        </select>
      </div>
    </div>
  );
}