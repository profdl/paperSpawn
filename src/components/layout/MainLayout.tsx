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
import { Menu } from '../ui/Menu';

export default function MainLayout() {
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);  // Add this new state

  return (
    <SimulationProvider>
      <ToolProvider>
        <div className="min-h-screen bg-black relative">
        <Navbar 
            showUI={showControlPanel} 
            showAppearance={showAppearance}
            onToggleUI={() => setShowControlPanel(!showControlPanel)}
            onToggleAppearance={() => setShowAppearance(!showAppearance)}
            onOpenProjects={() => setShowProjectsDrawer(true)}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />
          <ToolProperties />
          <div className="flex">
            <VerticalToolbar />
            <div className="flex-1 pt-20 pr-4"> 
              <div className="relative bg-black/10 rounded-lg">
                <VectorSimulationCanvas />
              </div>
            </div>
          </div>
  
          {showControlPanel && (
            <ControlPanel />
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