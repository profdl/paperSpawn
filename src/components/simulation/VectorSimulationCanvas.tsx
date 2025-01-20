import React, { useRef, useEffect, useCallback } from 'react';
import paper from 'paper';
import { useSimulation } from '../../contexts/SimulationContext';
import { useTool } from '../../contexts/ToolContext';
import { VectorParticleSystem } from './VectorParticleSystem';

export default function VectorSimulationCanvas() {
  const { settings, isPaused, systemRef } = useSimulation();
  const { currentTool, eraserProperties } = useTool();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastDrawPosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>();
  const isInitializedRef = useRef(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const getViewPoint = (e: React.MouseEvent<HTMLCanvasElement>): paper.Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return new paper.Point(0, 0);
    
    // Get point in canvas coordinates
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to view coordinates
    const viewPoint = paper.view.viewToProject(new paper.Point(x, y));
    return viewPoint;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (systemRef.current && currentTool === 'select') {
        systemRef.current.handleKeyboardShortcut(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;
    
    // Initialize with fixed size
    canvas.width = 500;
    canvas.height = 400;

    // Initialize Paper.js system
    systemRef.current = new VectorParticleSystem(canvas);
    isInitializedRef.current = true;

    // Force initial render
    paper.view.update();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none' || !systemRef.current) return;
    
    const point = getViewPoint(e);
    isDrawingRef.current = true;
    lastDrawPosRef.current = { x: point.x, y: point.y };

    if (currentTool === 'select') {
      if (systemRef.current.isHandleAt(point)) {
        isDrawingRef.current = true;
      }
      systemRef.current.selectItemAt(point);
      return;
    }

    if (currentTool === 'paint') {
      systemRef.current.createParticle(point.x, point.y);
    } else if (currentTool === 'erase') {
      systemRef.current.eraseParticlesNear(point.x, point.y, eraserProperties.size);
    }
  }, [currentTool, eraserProperties.size]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none' || !systemRef.current) return;
    if (!canvasRef.current) return;
    
    const point = getViewPoint(e);

    if (currentTool === 'select') {
      if (isDrawingRef.current) {
        const delta = new paper.Point(
          point.x - (lastDrawPosRef.current?.x || point.x),
          point.y - (lastDrawPosRef.current?.y || point.y)
        );
        systemRef.current.handleTransform(point, delta, e.shiftKey);
        lastDrawPosRef.current = { x: point.x, y: point.y };
      }
      return;
    }

    // Update last position for other tools
    lastDrawPosRef.current = { x: point.x, y: point.y };

    if (!isDrawingRef.current) return;
    
    if (currentTool === 'rectangle') {
      return;
    }
    
    if (lastDrawPosRef.current) {
      const { x: lastX, y: lastY } = lastDrawPosRef.current;
      const dx = point.x - lastX;
      const dy = point.y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(distance / 5));

      if (currentTool === 'paint') {
        for (let i = 0; i < steps; i++) {
          const px = lastX + (dx * i) / steps;
          const py = lastY + (dy * i) / steps;
          systemRef.current.createParticle(px, py);
        }
      } else if (currentTool === 'erase') {
        systemRef.current.eraseParticlesNear(point.x, point.y, eraserProperties.size);
      }
    }
  }, [currentTool, eraserProperties.size]);
  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDrawPosRef.current = null;
    
    if (!systemRef.current) return;
    
    if (currentTool === 'select') {
      systemRef.current.endTransform(); 
    } else if (currentTool !== 'rectangle') {
      systemRef.current.hideEraserCircle();
    }
  }, [currentTool]);

  const handleMouseLeave = useCallback(() => {
      handleMouseUp();
    }, [currentTool, handleMouseUp]);

  useEffect(() => {
    if (!systemRef.current) return;

    // Clear selection when changing tools
    if (currentTool !== 'select') {
      systemRef.current.clearSelection();
    }

    // Ensure view exists and is properly sized
    if (paper.view) {
      paper.view.viewSize = new paper.Size(500, 400);
    }

    const animate = () => {
      if (!isPaused) {
        systemRef.current?.updateParticles(settings);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    paper.view.update();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, settings]);

  useEffect(() => {
    if (systemRef.current) {
      systemRef.current.setColors(settings);
      systemRef.current.setBackgroundColor(settings.backgroundColor);
    }
  }, [settings.particleColor, settings.trailColor, settings.backgroundColor]);



  return (
    <div 
      ref={canvasWrapperRef} 
      className="relative" 
      tabIndex={0} 
      style={{ outline: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-lg w-full h-full"
        style={{ width: '500px', height: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}