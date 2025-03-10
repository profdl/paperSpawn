import { useState } from 'react';
import Navbar from './Navbar';
import ControlPanel from './ControlPanel';
import ProjectsDrawer from '../shared/ProjectsDrawer';
import GalleryDrawer from '../shared/GalleryDrawer';  // Add this import
import VerticalToolbar from './VerticalToolbar';
import { SimulationProvider } from '../../contexts/SimulationContext';
import { ToolProvider } from '../../contexts/ToolContext';
import VectorSimulationCanvas from './VectorSimulationCanvas';

export default function MainLayout() {
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const [showGalleryDrawer, setShowGalleryDrawer] = useState(false);  // Add this state
  const [showMenu, setShowMenu] = useState(false);
  const toggleGalleryDrawer = () => {
    setShowGalleryDrawer(prev => !prev); // Toggle the state
  };


  return (
    <SimulationProvider>
      <ToolProvider>
        <div className="min-h-screen bg-black relative">
          <div className="z-50">
            <Navbar 
              showUI={showControlPanel} 
              onToggleUI={() => setShowControlPanel(!showControlPanel)}
              onOpenProjects={() => setShowProjectsDrawer(true)}
              onToggleGallery={toggleGalleryDrawer}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
          </div>
          
          <div className="flex relative">
            {/* Left Toolbar */}
            <div className="z-40 w-16 flex-shrink-0">
              <VerticalToolbar />
            </div>

            {/* Center Canvas Container */}
            <div className="flex-1 flex justify-center pt-20"> 
              <div className="relative bg-black/10 rounded-lg">
                <VectorSimulationCanvas />
              </div>
            </div>

            {/* Right Control Panel */}
            {showControlPanel && (
              <div className="w-[260px] flex-shrink-0">
                <ControlPanel />
              </div>
            )}
          </div>


          
          <ProjectsDrawer
            isOpen={showProjectsDrawer}
            onClose={() => setShowProjectsDrawer(false)}
          />
          <GalleryDrawer
            isOpen={showGalleryDrawer}
            onClose={() => setShowGalleryDrawer(false)}
          />
        </div>
      </ToolProvider>
    </SimulationProvider>
  );
}