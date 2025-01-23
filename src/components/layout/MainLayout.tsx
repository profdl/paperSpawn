import { useState } from 'react';
import Navbar from '../ui/Navbar';
import ControlPanel from '../ui/ControlPanel';
import ToolProperties from '../ui/ToolProperties';
import SaveProjectModal from '../ui/SaveProjectModal';
import ProjectsDrawer from '../ui/ProjectsDrawer';
import VerticalToolbar from '../ui/VerticalToolbar';
import { SimulationProvider } from '../../contexts/SimulationContext';
import { ToolProvider } from '../../contexts/ToolContext';
import VectorSimulationCanvas from '../simulation/VectorSimulationCanvas';

export default function MainLayout() {
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <SimulationProvider>
      <ToolProvider>
      <div className="min-h-screen bg-black relative">
      <div className="z-50">
            <Navbar 
              showUI={showControlPanel} 
              onToggleUI={() => setShowControlPanel(!showControlPanel)}
              onOpenProjects={() => setShowProjectsDrawer(true)}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
            <ToolProperties />
          </div>
          
          <div className="flex relative">
            <div className="z-40">
              <VerticalToolbar />
            </div>
            <div className="flex-1 pt-20 pr-4 z-0"> 
              <div className="relative bg-black/10 rounded-lg">
                <VectorSimulationCanvas />
              </div>
            </div>
          </div>
  
          {showControlPanel && (
            <div className="absolute bottom-[100px] right-0 top-10">
              <ControlPanel />
            </div>
          )}

          <SaveProjectModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
          />
          
          <ProjectsDrawer
            isOpen={showProjectsDrawer}
            onClose={() => setShowProjectsDrawer(false)}
          />
        </div>
      </ToolProvider>
    </SimulationProvider>
  );
}