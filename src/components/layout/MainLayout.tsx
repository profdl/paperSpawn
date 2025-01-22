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
  const [showUI, setShowUI] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);

  return (
    <SimulationProvider>
      <ToolProvider>
      <div className="min-h-screen bg-black relative">
          <Navbar 
            showUI={showUI} 
            onToggleUI={() => setShowUI(!showUI)}
            onSave={() => setShowSaveModal(true)}
            onOpenProjects={() => setShowProjectsDrawer(true)}
          />
          <div className="pt-12 pl-4">
            <div className="relative bg-black/10 rounded-lg">
              <VectorSimulationCanvas />
            </div>
          </div>
  
          {showUI && (
            <>
              <ControlPanel />
              <ToolProperties />
            </>
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