import React from "react";
import DraggableNumberInput from "./DraggableNumberInput";
import { useTool } from "../../contexts/ToolContext";
import { useSimulation } from "../../contexts/SimulationContext";
import { EraserProperties } from "../../types";

export default function ToolProperties() {
  const { currentTool, eraserProperties, updateEraserProperties } = useTool();
  const { settings, updateSetting } = useSimulation();

  if (!currentTool || (currentTool !== "erase" && currentTool !== "paint"))
    return null;

  const handleEraserUpdate = (update: Partial<EraserProperties>) => {
    updateEraserProperties(update);
  };

  React.useEffect(() => {
  }, [settings]);

  return (
    <div className="fixed top-10 left-10  h-8 bg-black/70 z-30 flex items-left justify-left">
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
    </div>
  );
}