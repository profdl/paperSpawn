import React, { useRef, useEffect, useCallback, useState } from 'react';
import paper from 'paper';
import { useSimulation } from '../../contexts/SimulationContext';
import { useTool } from '../../contexts/ToolContext';
import { VectorParticleSystem } from './VectorParticleSystem';

interface CanvasSize {
  width: number;
  height: number;
}

export default function VectorSimulationCanvas() {
  const { settings, isPaused, systemRef } = useSimulation();
  const { currentTool, eraserProperties } = useTool();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastDrawPosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>();
  const isInitializedRef = useRef(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 500, height: 400 });

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
  const currentSettingsRef = useRef(settings);

  useEffect(() => {
    currentSettingsRef.current = settings;
    console.log('Settings updated in VectorSimulationCanvas:', settings);
  }, [settings]);

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
    
    // Initialize with current size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Initialize Paper.js system
    const handleResize = (width: number, height: number) => {
      setCanvasSize({ width, height });
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    // Initialize Paper.js system with canvas resize callback
    systemRef.current = new VectorParticleSystem(canvas, handleResize);
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

  console.log ('paintSpawnRate outside mouse event', settings.paintSpawnRate);  

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none' || !systemRef.current) return;
    
    const point = getViewPoint(e);
    isDrawingRef.current = true;
    lastDrawPosRef.current = { x: point.x, y: point.y };


    switch (currentTool) {
      case 'select':
        if (systemRef.current.isHandleAt(point)) {
          isDrawingRef.current = true;
        } else {
          systemRef.current.selectItemAt(point);
        }
        break;
        case 'freehand':
          console.log('Starting freehand path'); // Debug log
          systemRef.current.startFreehandPath(point);
          break;
      case 'paint':
        systemRef.current.createParticle(point.x, point.y);
        break;
      case 'erase':
        systemRef.current.eraseParticlesNear(point.x, point.y, eraserProperties.size);
        break;
    }
  }, [currentTool, eraserProperties.size]);

  const lastSpawnTimeRef = useRef<number>(Date.now());


  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none' || !systemRef.current) return;
    if (!canvasRef.current) return;
    
    const point = getViewPoint(e);

    switch (currentTool) {
      case 'select':
        if (isDrawingRef.current) {
          const delta = new paper.Point(
            point.x - (lastDrawPosRef.current?.x || point.x),
            point.y - (lastDrawPosRef.current?.y || point.y)
          );
          systemRef.current.handleTransform(point, delta, e.shiftKey);
          lastDrawPosRef.current = { x: point.x, y: point.y };
        }
        break;
      case 'freehand':
        if (isDrawingRef.current) {
          console.log('Continuing freehand path'); 
          systemRef.current.continueFreehandPath(point);
        }
        break;
        case 'paint':
          if (isDrawingRef.current && lastDrawPosRef.current) {
            const currentTime = Date.now();
            // Use the ref instead of the settings directly
            const currentSpawnRate = currentSettingsRef.current.paintSpawnRate;
            console.log('Current paint spawn rate in move:', currentSpawnRate);
            
            const spawnDelay = Math.round(100 * (1 - (currentSpawnRate - 1) / 49));
            if (currentTime - lastSpawnTimeRef.current >= spawnDelay) {
              const { x: lastX, y: lastY } = lastDrawPosRef.current;
              const dx = point.x - lastX;
              const dy = point.y - lastY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const steps = Math.max(1, Math.floor(distance / 5));
    
              for (let i = 0; i < steps; i++) {
                const px = lastX + (dx * i) / steps;
                const py = lastY + (dy * i) / steps;
                systemRef.current.createParticle(px, py);
              }
              
              lastSpawnTimeRef.current = currentTime;
            }
            lastDrawPosRef.current = { x: point.x, y: point.y };
          }
          break;
      case 'erase':
        if (isDrawingRef.current) {
          systemRef.current.eraseParticlesNear(point.x, point.y, eraserProperties.size);
        }
        break;
    }
  }, [currentTool, eraserProperties.size]);

  const handleMouseUp = useCallback(() => {
    if (!systemRef.current) return;
    
    if (currentTool === 'freehand' && isDrawingRef.current) {
      console.log('Ending freehand path'); // Debug log
      systemRef.current.endFreehandPath();
    }
    
    isDrawingRef.current = false;
    lastDrawPosRef.current = null;
    
    if (!systemRef.current) return;
    
    if (currentTool === 'select') {
      systemRef.current.endTransform(); 
    }else if (currentTool !== 'rectangle') {
        systemRef.current.hideEraserCircle();
      
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
        systemRef.current?.updateParticles(settings); // Make sure settings are passed
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
        className="rounded-lg"
        style={{ 
          width: `${canvasSize.width}px`, 
          height: `${canvasSize.height}px` 
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}