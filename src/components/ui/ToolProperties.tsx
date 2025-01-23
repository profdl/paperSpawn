import { CloudHail } from 'lucide-react';
import DraggableNumberInput from './DraggableNumberInput';
import { useTool } from '../../contexts/ToolContext';
import { useSimulation } from '../../contexts/SimulationContext';
import { EraserProperties, SpawnPattern } from '../../types';

export default function ToolProperties() {
  const { currentTool, eraserProperties, updateEraserProperties } = useTool();
  const { settings, updateSetting, handleRespawn } = useSimulation();

  if (!currentTool || (currentTool !== 'erase' && currentTool !== 'paint')) return null;

  const handleEraserUpdate = (update: Partial<EraserProperties>) => {
    updateEraserProperties(update);
  };

  return (
    <div className="fixed top-10 left-40 right-0 h-8 bg-black/70 z-40 flex items-center justify-left">
      {currentTool === 'erase' && (
        <div className="flex items-center gap-0">
          <label className="text-xs">Size</label>
          <DraggableNumberInput
            value={eraserProperties.size}
            onChange={(value) => handleEraserUpdate({ size: value })}
            min={5}
            max={100}
            step={1}
            formatValue={(v) => `${v}px`}
          />
        </div>
      )}

      {currentTool === 'paint' && (
        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <label className="text-xs">Count</label>
            <DraggableNumberInput
              value={settings.count}
              onChange={(value) => updateSetting('count', value)}
              min={0}
              max={700}
              step={1}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs">Pattern</label>
            <select
              className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs"
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
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Respawn Particles"
          >
            <CloudHail className="w-4 h-4 text-cyan-500" />
          </button>
        </div>
      )}
    </div>
  );
}