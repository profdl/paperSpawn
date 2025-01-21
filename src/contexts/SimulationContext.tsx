import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { SimulationSettings, presets } from '../types';
import { VectorParticleSystem } from '../components/simulation/VectorParticleSystem';

interface SimulationContextType {
  settings: SimulationSettings;
  updateSetting: (key: keyof SimulationSettings, value: string | number | boolean) => void;
  updateSettings: (newSettings: SimulationSettings) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  handleRespawn: () => void;
  handleClear: () => void;
  systemRef: React.MutableRefObject<VectorParticleSystem | undefined>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SimulationSettings>(presets.fish);
  const [isPaused, setIsPaused] = useState(false);
  const systemRef = useRef<VectorParticleSystem>();

  const updateSetting = (key: keyof SimulationSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newSettings: SimulationSettings) => {
    setSettings(newSettings);
  };

  const handleRespawn = useCallback(() => {
    if (systemRef.current) {
      const { width, height } = systemRef.current.getCanvasDimensions();
      // Ensure we're using the correct fixed dimensions
      const canvasWidth = 500;  // Match canvas.width
      const canvasHeight = 400; // Match canvas.height
      
      systemRef.current.clearParticlesOnly();
      
      for (let i = 0; i < settings.count; i++) {
        switch (settings.spawnPattern) {
          case 'scatter': {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            systemRef.current.createParticle(x, y);
            break;
          }
          case 'grid': {
            const cols = Math.ceil(Math.sqrt(settings.count * canvasWidth / canvasHeight));
            const rows = Math.ceil(settings.count / cols);
            const cellWidth = canvasWidth / cols;
            const cellHeight = canvasHeight / rows;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = (col + 0.5) * cellWidth;
            const y = (row + 0.5) * cellHeight;
            systemRef.current.createParticle(x, y);
            break;
          }
          case 'circle': {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const radius = Math.min(canvasWidth, canvasHeight) * 0.4;
            const angle = (i / settings.count) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            systemRef.current.createParticle(x, y);
            break;
          }
          case 'point': {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const spread = 5;
            const x = centerX + (Math.random() - 0.5) * spread;
            const y = centerY + (Math.random() - 0.5) * spread;
            systemRef.current.createParticle(x, y);
            break;
          }
        }
      }
    }
  }, [settings.count, settings.spawnPattern]);

  const handleClear = useCallback(() => {
    if (systemRef.current) {
      systemRef.current.clear();
    }
  }, []);

  const value = {
    settings,
    updateSetting,
    updateSettings,
    isPaused,
    setIsPaused,
    handleRespawn,
    handleClear,
    systemRef
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};