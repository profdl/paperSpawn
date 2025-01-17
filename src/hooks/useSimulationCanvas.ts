import { useEffect, useRef, RefObject } from 'react';
import { SimulationSettings } from '../types/particle';

interface SimulationCanvasProps {
  chemicalCanvasRef: RefObject<HTMLCanvasElement>;
  particleCanvasRef: RefObject<HTMLCanvasElement>;
  onResize: (width: number, height: number) => void;
}

export function useSimulationCanvas({
  chemicalCanvasRef,
  particleCanvasRef,
  onResize
}: SimulationCanvasProps) {
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const chemicalCanvas = chemicalCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!chemicalCanvas || !particleCanvas) return;

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      chemicalCanvas.width = width;
      chemicalCanvas.height = height;
      particleCanvas.width = width;
      particleCanvas.height = height;
      
      onResize(width, height);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [chemicalCanvasRef, particleCanvasRef, onResize]);

  return { animationFrameRef };
}