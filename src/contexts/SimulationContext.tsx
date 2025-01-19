import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { SimulationSettings, presets } from '../types';
import { VectorParticleSystem } from '../components/simulation/VectorParticleSystem';

interface SimulationContextType {
  settings: SimulationSettings;
  updateSetting: <K extends keyof SimulationSettings>(key: K, value: SimulationSettings[K]) => void;
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

  const updateSetting = useCallback(<K extends keyof SimulationSettings>(
    key: K,
    value: SimulationSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleRespawn = useCallback(() => {
    // Implement if needed
  }, []);

  const handleClear = useCallback(() => {
    if (systemRef.current) {
      systemRef.current.clear();
    }
  }, []);

  const value = {
    settings,
    updateSetting,
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

// Export the hook separately from the context creation
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};