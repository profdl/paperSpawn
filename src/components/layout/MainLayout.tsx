import React, { useState } from 'react';
import Navbar from '../Navbar';
import ControlPanel from '../ControlPanel';
import ToolProperties from '../ToolProperties';
import SimulationCanvas from '../simulation/SimulationCanvas';
import { SimulationProvider } from '../../contexts/SimulationContext';
import { ToolProvider } from '../../contexts/ToolContext';
import VectorSimulationCanvas from '../simulation/VectorSimulationCanvas';

export default function MainLayout() {
  const [showUI, setShowUI] = useState(true);

  return (
    <SimulationProvider>
      <ToolProvider>
        <div className="min-h-screen bg-black relative">
          <Navbar showUI={showUI} onToggleUI={() => setShowUI(!showUI)} />
          <div className="pt-12 pl-4">
            <div 
              className="relative bg-black/10 rounded-lg"
              style={{ 
                width: '500px',
                height: '400px'
              }}
            >
              <VectorSimulationCanvas />
            </div>
          </div>
          {showUI && (
            <>
              <ControlPanel />
              <ToolProperties />
            </>
          )}
        </div>
      </ToolProvider>
    </SimulationProvider>
  );
}