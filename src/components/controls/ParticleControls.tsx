import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../ui/DraggableNumberInput';

export default function ParticleControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-4">
      <div>

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
          <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Angle Sensor</label>
            <DraggableNumberInput
              value={settings.sensorAngle}
              onChange={(value) => updateSetting('sensorAngle', value)}
              min={0}
              max={180}
              step={1}
              formatValue={(v) => `${v}°`}
            />
          </div>
         
        </div>
          <div className="control">
        <label className="inline-block w-[80px] text-[10px]">Paint Mode</label>
        <input
          type="checkbox"
          checked={settings.paintingModeEnabled}
          onChange={(e) => updateSetting('paintingModeEnabled', e.target.checked)}
          className="ml-2"
        />
      </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Active Time</label>
            <DraggableNumberInput
              value={settings.activeStateDuration}
              onChange={(value) => updateSetting('activeStateDuration', value)}
              min={0}
              max={50000}
              step={100}
              formatValue={(v) => `${v}ms`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}