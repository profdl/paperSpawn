import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from "react";
import { SimulationSettings, presets } from "../types";
import { VectorParticleSystem } from "../components/simulation/VectorParticleSystem";
import paper from "paper";

interface SimulationContextType {
  settings: SimulationSettings;
  updateSetting: (
    key: keyof SimulationSettings,
    value: string | number | boolean
  ) => void;
  updateSettings: (newSettings: SimulationSettings) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  handleRespawn: () => void;
  handleClear: () => void;
  systemRef: React.MutableRefObject<VectorParticleSystem | undefined>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined
);

export function SimulationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SimulationSettings>(presets.start);
  const [isPaused, setIsPaused] = useState(false);
  const systemRef = useRef<VectorParticleSystem>();

  const updateSetting = useCallback(
    (key: keyof SimulationSettings, value: string | number | boolean) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        return newSettings;
      });
    },
    []
  );

  const updateSettings = (newSettings: SimulationSettings) => {
    setSettings(newSettings);
  };

  const handleRespawn = useCallback(() => {
    if (systemRef.current) {
      const canvasWidth = 500;
      const canvasHeight = 400;

      systemRef.current.clearParticlesOnly();

      // Get all closed paths from the obstacle manager
      const closedPaths = systemRef.current.getClosedPaths();

      // Helper function to check if a point is inside any obstacle
      const isPointInsideObstacle = (x: number, y: number): boolean => {
        const point = new paper.Point(x, y);
        return closedPaths.some((path) => path.contains(point));
      };

      let attemptCount = 0;
      const maxAttempts = settings.count * 3; // Prevent infinite loops
      let particlesCreated = 0;

      while (particlesCreated < settings.count && attemptCount < maxAttempts) {
        let x: number, y: number;

        switch (settings.spawnPattern) {
          case "scatter": {
            x = Math.random() * canvasWidth;
            y = Math.random() * canvasHeight;
            break;
          }
          case "grid": {
            const cols = Math.ceil(
              Math.sqrt((settings.count * canvasWidth) / canvasHeight)
            );
            const rows = Math.ceil(settings.count / cols);
            const cellWidth = canvasWidth / cols;
            const cellHeight = canvasHeight / rows;
            const col = particlesCreated % cols;
            const row = Math.floor(particlesCreated / cols);
            x = (col + 0.5) * cellWidth;
            y = (row + 0.5) * cellHeight;
            break;
          }
          case "circle": {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const radius = Math.min(canvasWidth, canvasHeight) * 0.4;
            const angle = (particlesCreated / settings.count) * Math.PI * 2;
            x = centerX + Math.cos(angle) * radius;
            y = centerY + Math.sin(angle) * radius;
            break;
          }
          case "point": {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const spread = 5;
            x = centerX + (Math.random() - 0.5) * spread;
            y = centerY + (Math.random() - 0.5) * spread;
            break;
          }
          default: {
            x = 0;
            y = 0;
          }
        }

        // Only create particle if point is not inside any obstacle
        if (!isPointInsideObstacle(x, y)) {
          systemRef.current.createParticle(x, y);
          particlesCreated++;
        }

        attemptCount++;
      }
      // Log if we couldn't create all particles
      if (particlesCreated < settings.count) {
        console.warn(
          `Only created ${particlesCreated} particles out of ${settings.count} due to obstacles`
        );
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
    systemRef,
  };

  React.useEffect(() => {
  }, [settings]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
