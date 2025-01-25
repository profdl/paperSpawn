import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../ui/DraggableNumberInput';
import { SpawnPattern } from '../../types';

export default function ParticleControls() {
  const { settings, updateSetting, systemRef } = useSimulation();

  return (
    <div className="pb-1 space-y-4">
      <div>
        <div className="space-y-1.5">
        <div className="control">
        <label className="inline-block w-[80px] text-[10px]">Trails</label>
        <input
          type="checkbox"
          checked={settings.paintingModeEnabled}
          onChange={(e) => updateSetting('paintingModeEnabled', e.target.checked)}
          className="ml-4"
        />
      </div>
      <label className="inline-block w-[80px] text-[10px]">Particle Size</label>
            <DraggableNumberInput
              value={settings.particleSize}
              onChange={(value) => {
                updateSetting('particleSize', value);
                systemRef.current?.setParticleRadius(value);
              }}
              min={0.5}
              max={10}
              step={0.5}
              formatValue={(v) => `${v}px`}
            />

         

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
            <label className="inline-block w-[80px] text-[10px]">Spawn Rate</label>
            <DraggableNumberInput
              value={settings.paintSpawnRate}
              onChange={(value) => updateSetting("paintSpawnRate", value)}
              min={1}
              max={50}
              step={1}
              formatValue={(v) => `${v}`}
            />
          </div>
          <div className="pt-3 text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Batch Spawn
        </div>
        <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Spawn Count</label>
            <DraggableNumberInput
              value={settings.count}
              onChange={(value) => updateSetting("count", value)}
              min={0}
              max={700}
              step={1}
            />
          </div>

          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Spawn Pattern</label>
            <select
              className="bg-black/50 border border-white/20 py-1 rounded text-[10px] ml-4"
              value={settings.spawnPattern}
              onChange={(e) =>
                updateSetting("spawnPattern", e.target.value as SpawnPattern)
              }
            >
              <option value="scatter">Scatter</option>
              <option value="grid">Grid Pattern</option>
              <option value="circle">Circle Pattern</option>
              <option value="point">Point</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}