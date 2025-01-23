import { CloudHail } from "lucide-react";
import DraggableNumberInput from "./DraggableNumberInput";
import { useTool } from "../../contexts/ToolContext";
import { useSimulation } from "../../contexts/SimulationContext";
import { EraserProperties, SpawnPattern } from "../../types";

export default function ToolProperties() {
  const { currentTool, eraserProperties, updateEraserProperties } = useTool();
  const { settings, updateSetting, handleRespawn } = useSimulation();

  if (!currentTool || (currentTool !== "erase" && currentTool !== "paint"))
    return null;

  const handleEraserUpdate = (update: Partial<EraserProperties>) => {
    updateEraserProperties(update);
  };

  return (
    <div className="fixed top-10 left-40 right-0 h-8 bg-black/70 z-40 flex items-center justify-left">
      {currentTool === "erase" && (
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

      {currentTool === "paint" && (
        <div className="flex items-center gap-4 ml-4">
          <button
            onClick={handleRespawn}
            className="p-1.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
            title="Respawn Particles"
          >
            <CloudHail className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-cyan-500">Spawn</span>
          </button>
          <div className="flex items-center gap-0">
          <label className="text-[10px] mb-0">Count</label>
            <DraggableNumberInput 
              value={settings.count}
              onChange={(value) => updateSetting("count", value)}
              min={0}
              max={700}
              step={1}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-black/50 border border-white/20 py-1 rounded text-[10px]"
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
      )}
    </div>
  );
}
