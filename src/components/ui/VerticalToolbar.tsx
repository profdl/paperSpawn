import React from 'react';
import { MousePointer, ImageOff, Palette, Pen, Square, ImagePlus, Trash } from "lucide-react";
import { useTool } from "../../contexts/ToolContext";
import { useSimulation } from "../../contexts/SimulationContext";
import AppearanceControls from '../controls/AppearanceControls';


export default function VerticalToolbar() {
  const { currentTool, setTool } = useTool();
  const { systemRef } = useSimulation();
  const [showAppearanceControls, setShowAppearanceControls] = React.useState(false);
  const [hasBackgroundImage, setHasBackgroundImage] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
      setHasBackgroundImage(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackgroundImage = () => {
    if (!systemRef.current) return;
    systemRef.current.removeBackgroundImage();
    setHasBackgroundImage(false);
  };

  const handleClearObstacles = () => {
    if (!systemRef.current) return;
    systemRef.current.clearObstacles();
  };

  return (
    <div ref={containerRef} className="relative pt-20 pl-4 bg-black/70 backdrop-blur-sm h-screen">
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



        <button
          className="p-2 rounded hover:bg-white/10 transition-colors"
          onClick={handleClearObstacles}
          title="Clear Obstacles"
        >
          <Trash className="w-4 h-4" />
        </button>

        <div className="p-2"></div>

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

        {hasBackgroundImage && (
          <button
            className="p-2 rounded hover:bg-white/10 transition-colors"
            onClick={handleRemoveBackgroundImage}
            title="Remove Background Image"
          >
            <ImageOff className="w-4 h-4" />
          </button>
        )}

        <div className="relative">
          <button
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              showAppearanceControls ? "bg-white/20" : ""
            }`}
            onClick={() => setShowAppearanceControls(!showAppearanceControls)}
            title="Appearance Settings"
          >
            <Palette className="w-4 h-4 text-white" />
          </button>

          {showAppearanceControls && (
            <div 
              className="absolute left-full ml-2 w-80 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 text-white"
              style={{
                zIndex: 20,
                pointerEvents: 'auto',
                top: '-130px'
              }}
            >
              <div className="p-4">
                <AppearanceControls />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}