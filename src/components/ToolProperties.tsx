import React from 'react';
import DraggableNumberInput from './DraggableNumberInput';
import { useTool } from '../contexts/ToolContext';

export default function ToolProperties() {
  const { currentTool, eraserProperties, updateEraserProperties } = useTool();

  if (currentTool !== 'erase') return null;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-black/70 rounded-lg p-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs">
          <input
            type="checkbox"
            checked={eraserProperties.eraseParticles}
            onChange={(e) => updateEraserProperties({ eraseParticles: e.target.checked })}
            className="mr-2"
          />
          Erase Particles
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs">
          <input
            type="checkbox"
            checked={eraserProperties.eraseTrails}
            onChange={(e) => updateEraserProperties({ eraseTrails: e.target.checked })}
            className="mr-2"
          />
          Erase Trails
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs">Size</label>
        <DraggableNumberInput
          value={eraserProperties.size}
          onChange={(value) => updateEraserProperties({ size: value })}
          min={5}
          max={100}
          step={1}
          formatValue={(v) => `${v}px`}
        />
      </div>
    </div>
  );
}