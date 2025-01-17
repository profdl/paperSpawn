import React, { createContext, useContext, useCallback } from 'react';
import { SimulationSettings, presets } from '../types/particle';

interface SettingsContextType {
  settings: SimulationSettings;
  updateSetting: <K extends keyof SimulationSettings>(
    key: K,
    value: SimulationSettings[K]
  ) => void;
  loadPreset: (preset: keyof typeof presets) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
  children,
  settings,
  onSettingChange,
  onPresetChange
}: {
  children: React.ReactNode;
  settings: SimulationSettings;
  onSettingChange: (key: keyof SimulationSettings, value: any) => void;
  onPresetChange: (preset: keyof typeof presets) => void;
}) {
  const updateSetting = useCallback(<K extends keyof SimulationSettings>(
    key: K,
    value: SimulationSettings[K]
  ) => {
    onSettingChange(key, value);
  }, [onSettingChange]);

  const loadPreset = useCallback((preset: keyof typeof presets) => {
    onPresetChange(preset);
  }, [onPresetChange]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loadPreset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}