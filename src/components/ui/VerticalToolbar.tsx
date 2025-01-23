import React from 'react';
import { MousePointer, Pen, Square, ImagePlus, Trash } from "lucide-react";
import { useTool } from "../../contexts/ToolContext";
import { useSimulation } from "../../contexts/SimulationContext";

export default function VerticalToolbar() {
  const { currentTool, setTool } = useTool();
  const { systemRef } = useSimulation();

  const handleRectangleClick = () => {
    if (!systemRef.current) return;

    const centerX = 500 / 2;
    const centerY = 400 / 2;

    systemRef.current.startRectangle(centerX, centerY);
    setTool("select");

    const point = new paper.Point(centerX, centerY);
    systemRef.current.selectItemAt(point);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !systemRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      systemRef.current?.setBackgroundImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearObstacles = () => {
    if (!systemRef.current) return;
    systemRef.current.clearObstacles();
  };

  return (
    <div className="pt-20 pl-4 bg-black/70 backdrop-blur-sm h-screen">
      <div className="flex flex-col gap-1">
        <button
          className={`p-2 rounded hover:bg-white/10 transition-colors ${
            currentTool === "select" ? "bg-white/20" : ""
          }`}
          onClick={() => setTool(currentTool === "select" ? "none" : "select")}
          title="Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          className={`p-2 rounded hover:bg-white/10 transition-colors ${
            currentTool === "freehand" ? "bg-white/20" : ""
          }`}
          onClick={() => setTool(currentTool === "freehand" ? "none" : "freehand")}
          title="Draw Boundary (B)"
        >
          <Pen className="w-4 h-4" />
        </button>

        <button
          className={`p-2 rounded hover:bg-white/10 transition-colors ${
            currentTool === "rectangle" ? "bg-white/20" : ""
          }`}
          onClick={handleRectangleClick}
          title="Draw Rectangle (R)"
        >
          <Square className="w-4 h-4" />
        </button>

        <label
          className="p-2 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title="Upload Background Image"
        >
          <ImagePlus className="w-4 h-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>

        <button
          className="p-2 rounded hover:bg-white/10 transition-colors"
          onClick={handleClearObstacles}
          title="Clear Obstacles"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}