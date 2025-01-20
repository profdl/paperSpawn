import React from 'react';
import { Eye, EyeOff,  Pencil, Eraser, Pause, Play, Trash2, FileDown, Square, MousePointer } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../ui/AuthModal';
import { useSimulation } from '../../contexts/SimulationContext'; 
import { useTool } from '../../contexts/ToolContext';

interface NavbarProps {
  showUI: boolean;
  onToggleUI: () => void;
}

export default function Navbar({ showUI, onToggleUI }: NavbarProps) {
  const { user, signOut } = useAuth();
  const {  isPaused, setIsPaused, handleClear } = useSimulation();
  const { currentTool, setTool } = useTool();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { systemRef } = useSimulation();

  const handleClearParticles = () => {
    if (!systemRef.current) return;
    systemRef.current.clearParticlesOnly();
  };

  const handleRectangleClick = () => {
    if (!systemRef.current) return;
    
    // Calculate center point of canvas
    const centerX = 500 / 2;  // canvas width / 2
    const centerY = 400 / 2;  // canvas height / 2
    
    // Create rectangle at center
    const rectangle = systemRef.current.startRectangle(centerX, centerY);
    
    // Switch to select tool and select the new rectangle
    setTool('select');
    
    // Select the newly created rectangle
    const point = new paper.Point(centerX, centerY);
    systemRef.current.selectItemAt(point);
  };

  const handleDownload = () => {
    if (!systemRef.current) return;

    const svgContent = systemRef.current.exportSVG();
    const link = document.createElement('a');
    link.download = `field-conditions-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.svg`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
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
              <span className="text-white font-mono text-sm">Field Conditions</span>
              <div className="flex items-center gap-1">
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
                <button
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
            currentTool === 'rectangle' ? 'bg-white/20' : ''
          }`}
          onClick={handleRectangleClick}
          title="Draw Rectangle (R)"
        >
          <Square className="w-4 h-4" />
        </button>
                <button
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                    currentTool === 'select' ? 'bg-white/20' : ''
                  }`}
                  onClick={() => setTool(currentTool === 'select' ? 'none' : 'select')}
                  title="Select (V)"
                >
                  <MousePointer className="w-4 h-4" />
                </button>
                <div className="w-px bg-white/20 mx-1" />
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
               <button
        className="p-1.5 rounded hover:bg-white/10 transition-colors"
        onClick={handleClearParticles}
        title="Clear Particles"
      >
        <Trash2 className="w-4 h-4" />
      </button>
              </div>
            </div>
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
              <button
                onClick={handleDownload}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="Export as SVG"
              >
                <FileDown className="w-4 h-4" />
              </button>
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