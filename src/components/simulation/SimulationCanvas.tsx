import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useTool } from '../../contexts/ToolContext';

export default function SimulationCanvas() {
  const { simulation, settings, isPaused, chemicalGrid } = useSimulation();
  const { currentTool, eraserProperties } = useTool();
  const chemicalCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef<number>();

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none') return;
    
    isDrawingRef.current = true;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastDrawPosRef.current = { x, y };

    if (currentTool === 'paint') {
      simulation.addParticle(x, y);
    } else if (currentTool === 'erase') {
      if (eraserProperties.eraseParticles) {
        simulation.removeParticlesNear(x, y, eraserProperties.size);
      }
      if (eraserProperties.eraseTrails) {
        chemicalGrid.eraseGridArea(x, y, eraserProperties.size);
      }
    }
  }, [currentTool, eraserProperties, simulation, chemicalGrid]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || currentTool === 'none') return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastDrawPosRef.current) {
      const { x: lastX, y: lastY } = lastDrawPosRef.current;
      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(distance / 5));

      if (currentTool === 'paint') {
        for (let i = 0; i < steps; i++) {
          const px = lastX + (dx * i) / steps;
          const py = lastY + (dy * i) / steps;
          simulation.addParticle(px, py);
        }
      } else if (currentTool === 'erase') {
        if (eraserProperties.eraseParticles) {
          simulation.removeParticlesNear(x, y, eraserProperties.size);
        }
        if (eraserProperties.eraseTrails) {
          chemicalGrid.eraseGridArea(x, y, eraserProperties.size);
        }
      }
    }

    lastDrawPosRef.current = { x, y };
  }, [currentTool, eraserProperties, simulation, chemicalGrid]);

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDrawPosRef.current = null;
  }, []);

  const handleResize = useCallback(() => {
    const chemicalCanvas = chemicalCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!chemicalCanvas || !particleCanvas) return;

    const container = chemicalCanvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    
    chemicalCanvas.width = width;
    chemicalCanvas.height = height;
    particleCanvas.width = width;
    particleCanvas.height = height;
    
    chemicalGrid.initializeGrid(width, height);
  }, [chemicalGrid]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    if (!isInitializedRef.current) {
      const canvas = particleCanvasRef.current;
      if (canvas) {
        simulation.initializeParticles(canvas.width, canvas.height, settings);
        isInitializedRef.current = true;
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleResize, simulation, settings]);

  useEffect(() => {
    const chemicalCanvas = chemicalCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!chemicalCanvas || !particleCanvas) return;

    const chemicalCtx = chemicalCanvas.getContext('2d');
    const particleCtx = particleCanvas.getContext('2d');
    if (!chemicalCtx || !particleCtx) return;

    const animate = () => {
      if (!isPaused) {
        // Update simulation state
        chemicalGrid.updateGrid(simulation.particles.current, settings, chemicalCanvas.width, chemicalCanvas.height);
        simulation.updateParticles(settings, particleCanvas.width, particleCanvas.height);
      }

      // Render current state
      chemicalGrid.renderGrid(chemicalCtx, chemicalCanvas.width, chemicalCanvas.height, settings);

      // Clear and render particles
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particleCtx.fillStyle = settings.particleColor;
      
      
      simulation.particles.current.forEach(particle => {
        particleCtx.globalAlpha = particle.opacity;
        particleCtx.beginPath();
        particleCtx.arc(
          particle.x,
          particle.y,
          settings.particleSize,
          0,
          Math.PI * 2
        );
        particleCtx.fill();
      });
      
      particleCtx.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, simulation, settings, chemicalGrid]);

  return (
    <>
      <canvas
        ref={chemicalCanvasRef}
        className="absolute inset-0 w-full h-full rounded-lg"
      />
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </>
  );
}