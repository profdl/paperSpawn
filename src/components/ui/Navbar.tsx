import React from "react";
import {
  Settings,
  Wand,
  Eraser,
  Pause,
  Play,
  Trash2,
  FileDown,
  Save,
  FolderOpen,
  CloudHail,
  MenuIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import AuthModal from "../ui/AuthModal";
import { useSimulation } from "../../contexts/SimulationContext";
import { useTool } from "../../contexts/ToolContext";
import { useProjects } from "../../hooks/useProjects";
import { SimulationSettings } from "../../types";

interface NavbarProps {
  showUI: boolean;
  onToggleUI: () => void;
  onOpenProjects: () => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
}

export default function Navbar({
  showUI,
  onToggleUI,
  onOpenProjects,
  showMenu,
  setShowMenu,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const { isPaused, setIsPaused, systemRef, settings, handleRespawn } =
    useSimulation();

  const { currentTool, setTool } = useTool();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { saveProject } = useProjects();

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
        wanderRadius: settings.wanderRadius,
        paintSpawnRate: settings.paintSpawnRate,
        // Add the missing avoidance properties
        avoidanceEnabled: settings.avoidanceEnabled,
        avoidanceDistance: settings.avoidanceDistance,
        avoidanceStrength: settings.avoidanceStrength,
        avoidancePushMultiplier: settings.avoidancePushMultiplier,
      };

      const svgContent = systemRef.current.exportSVG();
      await saveProject("Untitled", svgContent, currentSettings);
      onOpenProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
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
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <MenuIcon className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-1">
                {/* Drawing Tools */}
                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "paint" ? "bg-white/20" : ""
                  } flex items-center gap-1`}
                  onClick={() => {
                    if (currentTool !== "paint") {
                      setTool("paint");
                    }
                  }}
                  title="Paint Particles (P)"
                >
                  <Wand className="w-4 h-4 " />
                  <span className="text-xs ">Spawn</span>
                </button>

                <button
                  onClick={handleRespawn}
                  className="p-1.5 rounded hover:bg-cyan-900  bg-white/10 transition-colors flex items-center gap-1"
                  title="Respawn Particles"
                >
                  <CloudHail className="w-4 h-4 " />
                  <span className="text-xs ">Batch Spawn</span>
                </button>

                {/* Divider */}
                <div className="w-px bg-white/20 mx-1" />

                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === "erase" ? "bg-white/20" : ""
                  }`}
                  onClick={() =>
                    setTool(currentTool === "erase" ? "none" : "erase")
                  }
                  title="Erase Particles (E)"
                >
                  <Eraser className="w-4 h-4 " />
                </button>

                <button
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  onClick={handleClearParticles}
                  title="Clear Particles"
                >
                  <Trash2 className="w-4 h-4 " />
                </button>

                <button
                  onClick={onToggleUI}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title={showUI ? "Hide UI" : "Show UI"}
                >
                  {showUI ? (
                    <Settings className="w-4 h-4 " />
                  ) : (
                    <Settings className="w-4 h-4 text-cyan-800" />
                  )}
                </button>

                {/* Divider */}
                <div className="w-px bg-white/20 mx-1" />

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
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="fixed top-10 left-0 z-50 w-48 bg-black/90 backdrop-blur-sm border border-white/10 rounded-br-lg shadow-lg">
          <div className="py-2">
            <button
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              onClick={() => {
                handleOpenProjects();
                setShowMenu(false);
              }}
            >
              <FolderOpen className="w-4 h-4" />
              Open Projects
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              onClick={() => {
                handleSave();
                setShowMenu(false);
              }}
            >
              <Save className="w-4 h-4" />
              Save Project
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              onClick={() => {
                handleDownload();
                setShowMenu(false);
              }}
            >
              <FileDown className="w-4 h-4" />
              Export as SVG
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
