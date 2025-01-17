import React from 'react';
import { Pencil, Eraser, Pause, Play, Trash2 } from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { useTool } from '../contexts/ToolContext';

export type Tool = 'paint' | 'erase' | 'none';

export default function Toolbar() {
  const { isPaused, setIsPaused, handleClear } = useSimulation();
  const { currentTool, setTool } = useTool();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 rounded-lg p-1 flex gap-1">
      <button
        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
          currentTool === 'paint' ? 'bg-white/20' : ''
        }`}
        onClick={() => setTool(currentTool === 'paint' ? 'none' : 'paint')}
        title="Paint Particles (P)"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
          currentTool === 'erase' ? 'bg-white/20' : ''
        }`}
        onClick={() => setTool(currentTool === 'erase' ? 'none' : 'erase')}
        title="Erase Particles (E)"
      >
        <Eraser className="w-4 h-4" />
      </button>
      <div className="w-px bg-white/20" />
      <button
        className="p-1.5 rounded hover:bg-white/10 transition-colors"
        onClick={() => setIsPaused(!isPaused)}
        title="Play/Pause (Space)"
      >
        {isPaused ? (
          <Play className="w-4 h-4" />
        ) : (
          <Pause className="w-4 h-4" />
        )}
      </button>
      <div className="w-px bg-white/20" />
      <button
        className="p-1.5 rounded hover:bg-white/10 transition-colors"
        onClick={handleClear}
        title="Clear All"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}