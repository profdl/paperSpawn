import React from "react";
import DraggableNumberInput from "./DraggableNumberInput";
import { useTool } from "../../contexts/ToolContext";
import { useSimulation } from "../../contexts/SimulationContext";
import { EraserProperties, SpawnPattern } from "../../types";

export default function ToolProperties() {
  const { currentTool, eraserProperties, updateEraserProperties } = useTool();
  const { settings, updateSetting  } = useSimulation();

  if (!currentTool || (currentTool !== "erase" && currentTool !== "paint"))
    return null;

  const handleEraserUpdate = (update: Partial<EraserProperties>) => {
    updateEraserProperties(update);
  };

  React.useEffect(() => {
    // console.log("Settings in ToolProperties:", settings);
  }, [settings]);

  return (
    <div className="fixed top-10   h-8 bg-black/70 z-40 flex items-left justify-left">
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
          <div className="control">
            <label className="inline-block  text-[10px]">
              Paint Spawn Rate
            </label>
            <DraggableNumberInput
              value={settings.paintSpawnRate}
              onChange={(value) => {
                updateSetting("paintSpawnRate", value);
              }}
              min={1}
              max={50}
              step={1}
              formatValue={(v) => `${v}`}
            />
          </div>
          <div className="flex items-center gap-0">
            <label className="text-[10px] mb-0">Batch Spawn</label>
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
