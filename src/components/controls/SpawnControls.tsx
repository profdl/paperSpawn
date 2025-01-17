import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import DraggableNumberInput from '../DraggableNumberInput';
import { SpawnPattern } from '../../types/particle';

export default function SpawnControls() {
  const { settings, updateSetting, handleRespawn } = useSimulation();

  return (
    <div className="space-y-2">
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
        <label className="inline-block w-[80px] text-[10px]">Count</label>
        <DraggableNumberInput
          value={settings.count}
          onChange={(value) => updateSetting('count', value)}
          min={0}
          max={2000}
          step={1}
        />
      </div>
      <div className="control mb-2">
        <label className="inline-block w-[80px] text-[10px]">Pattern</label>
        <select
          className="w-[120px] bg-black/50 border border-white/20 rounded px-2 py-1"
          value={settings.spawnPattern}
          onChange={(e) => updateSetting('spawnPattern', e.target.value as SpawnPattern)}
        >
          <option value="scatter">Scatter</option>
          <option value="grid">Grid</option>
          <option value="circle">Circle</option>
          <option value="point">Point</option>
        </select>
      </div>
      <button
        onClick={handleRespawn}
        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded py-1 px-2 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Respawn
      </button>
    </div>
  );
}