import { useState } from 'react';
import Navbar from '../ui/Navbar';
import ControlPanel from '../ui/ControlPanel';
import ToolProperties from '../ui/ToolProperties';
import SaveProjectModal from '../ui/SaveProjectModal';
import ProjectsDrawer from '../ui/ProjectsDrawer';
import { SimulationProvider } from '../../contexts/SimulationContext';
import { ToolProvider } from '../../contexts/ToolContext';
import VectorSimulationCanvas from '../simulation/VectorSimulationCanvas';

export default function MainLayout() {
  // Separate state for controls panel visibility
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);

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
          />
          <ToolProperties />
          <div className="pt-20 pl-4"> 
            <div className="relative bg-black/10 rounded-lg">
              <VectorSimulationCanvas />
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