import React, { createContext, useContext, useState } from 'react';

export type Quality = '1x' | '2x' | '4x' | '8x';

interface QualityContextType {
  quality: Quality;
  setQuality: (quality: Quality) => void;
  getScaleFactor: () => number;
}

const QualityContext = createContext<QualityContextType | undefined>(undefined);

export function useQuality() {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
}

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [quality, setQuality] = useState<Quality>('1x');

  const getScaleFactor = () => {
    switch (quality) {
      case '8x': return 8;
      case '4x': return 4;
      case '2x': return 2;
      default: return 1;
    }
  };

  return (
    <QualityContext.Provider value={{ quality, setQuality, getScaleFactor }}>
      {children}
    </QualityContext.Provider>
  );
}