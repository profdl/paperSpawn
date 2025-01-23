import React from "react";
import {
  Eye,
  EyeOff,
  Wand,
  Eraser,
  Pause,
  Play,
  Trash2,
  Trash,
  FileDown,
  Square,
  MousePointer,
  Save,
  FolderOpen,
  ImagePlus,
  Pen,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import AuthModal from "../ui/AuthModal";
import { useSimulation } from "../../contexts/SimulationContext";
import { useTool } from "../../contexts/ToolContext";
import paper from "paper";
import { useProjects } from "../../hooks/useProjects";
import { SimulationSettings } from "../../types";

interface NavbarProps {
  showUI: boolean;
  onToggleUI: () => void;
  onOpenProjects: () => void;
}

export default function Navbar({
  showUI,
  onToggleUI,
  onOpenProjects,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const { isPaused, setIsPaused, systemRef, settings } = useSimulation(); // Add settings here
  const { currentTool, setTool } = useTool();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { saveProject } = useProjects();
  
  const handleClearObstacles = () => {
    if (!systemRef.current) return;
    systemRef.current.clearObstacles();  // Using the public method instead
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
  
    if (!systemRef.current) return;
  
    try {
      // Get all current settings from the simulation
      const currentSettings: SimulationSettings = {
        count: settings.count,
        particleSize: settings.particleSize,
        speed: settings.speed,
        flockingEnabled: settings.flockingEnabled,
        separation: settings.separation,
        cohesion: settings.cohesion,
        alignment: settings.alignment,
        separationDistance: settings.separationDistance,
        cohesionDistance: settings.cohesionDistance,
        alignmentDistance: settings.alignmentDistance,
        slimeBehavior: settings.slimeBehavior,
        sensorAngle: settings.sensorAngle,
        sensorDistance: settings.sensorDistance,
        turnRate: settings.turnRate,
        spawnPattern: settings.spawnPattern,
        backgroundColor: settings.backgroundColor,
        particleColor: settings.particleColor,
        trailColor: settings.trailColor,
        chemicalDeposit: settings.chemicalDeposit,
        diffusionRate: settings.diffusionRate,
        decayRate: settings.decayRate,
        paintingModeEnabled: settings.paintingModeEnabled,
        activeStateDuration: settings.activeStateDuration,
        freezingDuration: settings.freezingDuration,
        trailPersistence: settings.trailPersistence,
        externalForceAngle: settings.externalForceAngle,
        externalForceAngleRandomize: settings.externalForceAngleRandomize,
        externalForceStrength: settings.externalForceStrength,
        boundaryBehavior: settings.boundaryBehavior,
        wanderEnabled: settings.wanderEnabled,
        wanderStrength: settings.wanderStrength,
        wanderSpeed: settings.wanderSpeed,
        wanderRadius: settings.wanderRadius
      };
  
      const svgContent = systemRef.current.exportSVG();
      await saveProject("Untitled", svgContent, currentSettings);
      onOpenProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
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

  const handleClearParticles = () => {
    if (!systemRef.current) return;
    systemRef.current.clearParticlesOnly();
  };

  const handleOpenProjects = () => {
    if (user) {
      // This will trigger the drawer to open
      onOpenProjects();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleRectangleClick = () => {
    if (!systemRef.current) return;

    // Calculate center point of canvas
    const centerX = 500 / 2; // canvas width / 2
    const centerY = 400 / 2; // canvas height / 2

    // Create rectangle at center
    systemRef.current.startRectangle(centerX, centerY);

    // Switch to select tool and select the new rectangle
    setTool("select");

    // Select the newly created rectangle
    const point = new paper.Point(centerX, centerY);
    systemRef.current.selectItemAt(point);
  };
  const handleDownload = () => {
    if (!systemRef.current) return;

    const svgContent = systemRef.current.exportSVG();
    const link = document.createElement("a");
    link.download = `field-conditions-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.svg`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-sm h-10">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <span className="text-white font-mono text-sm">
                Field Conditions
              </span>
              <div className="flex items-center gap-1">
                {/* Drawing Tools */}
                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "paint" ? "bg-white/20" : ""
                  }`}
                  onClick={() =>
                    setTool(currentTool === "paint" ? "none" : "paint")
                  }
                  title="Paint Particles (P)"
                >
                  <Wand className="w-4 h-4 text-cyan-500" />
                </button>
                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "erase" ? "bg-white/20" : ""
                  }`}
                  onClick={() =>
                    setTool(currentTool === "erase" ? "none" : "erase")
                  }
                  title="Erase Particles (E)"
                >
                  <Eraser className="w-4 h-4 text-cyan-500" />
                </button>

                <button
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  onClick={handleClearParticles}
                  title="Clear Particles"
                >
                  <Trash2 className="w-4 h-4 text-cyan-500" />
                </button>

                {/* Divider */}
                <div className="w-px bg-white/20 mx-1" />
                {/* Divider */}
                <div className="w-px bg-white/20 mx-1" />
                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "select" ? "bg-white/20" : ""
                  }`}
                  onClick={() =>
                    setTool(currentTool === "select" ? "none" : "select")
                  }
                  title="Select (V)"
                >
                  <MousePointer className="w-4 h-4  text-red-500" />
                </button>

                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "freehand" ? "bg-white/20" : ""
                  }`}
                  onClick={() =>
                    setTool(currentTool === "freehand" ? "none" : "freehand")
                  }
                  title="Draw Boundary (B)"
                >
                  <Pen className="w-4 h-4 text-red-500" />
                </button>

                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "rectangle" ? "bg-white/20" : ""
                  }`}
                  onClick={handleRectangleClick}
                  title="Draw Rectangle (R)"
                >
                  <Square className="w-4 h-4 text-red-500" />
                </button>
                <label
                  className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Upload Background Image"
                >
                  <ImagePlus className="w-4 h-4  text-red-500" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <button
      className="p-1.5 rounded hover:bg-white/10 transition-colors"
      onClick={handleClearObstacles}
      title="Clear Obstacles"
    >
      <Trash className="w-4 h-4 text-red-500" />
    </button>
                {/* Divider */}
                <div className="w-px bg-white/20 mx-1" />


                {/* Project Management */}
                <button
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  onClick={handleOpenProjects}
                  title={user ? "Open Projects" : "Sign in to open projects"}
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  onClick={handleSave}
                  title={user ? "Save Project" : "Sign in to save project"}
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                onClick={handleDownload}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="Export as SVG"
              >
                <FileDown className="w-4 h-4" />
              </button>
                {/* Simulation Controls */}
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
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
              {/* Auth */}
              {user ? (
                <button
                  onClick={signOut}
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </button>
              )}

              {/*  UI Toggle */}

              <button
                onClick={onToggleUI}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title={showUI ? "Hide UI" : "Show UI"}
              >
                {showUI ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
