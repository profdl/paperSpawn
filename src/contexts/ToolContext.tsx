import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tool } from '../types';

interface EraserProperties {
  eraseParticles: boolean;
  eraseTrails: boolean;
  size: number;
}

interface ToolContextType {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
  eraserProperties: EraserProperties;
  updateEraserProperties: (props: Partial<EraserProperties>) => void;
}




const ToolContext = createContext<ToolContextType | undefined>(undefined);

export function ToolProvider({ children }: { children: React.ReactNode }) {
  const [currentTool, setCurrentTool] = useState<Tool>('paint'); // Set paint as default tool
  const [eraserProperties, setEraserProperties] = useState<EraserProperties>({
    eraseParticles: true,
    eraseTrails: true,
    size: 20
  });

  const setTool = useCallback((tool: Tool) => {
    setCurrentTool(tool);
  }, []);

  const updateEraserProperties = useCallback((props: Partial<EraserProperties>) => {
    setEraserProperties(prev => ({ ...prev, ...props }));
  }, []);

  return (
    <ToolContext.Provider
      value={{
        currentTool,
        eraserProperties,
        setTool,
        updateEraserProperties
      }}
    >
      {children}
    </ToolContext.Provider>
  );
}

export function useTool() {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
}