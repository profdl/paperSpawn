import React, { useRef, useEffect, useState } from "react";
import { useSimulation } from "../../contexts/SimulationContext";
import { useTool } from "../../contexts/ToolContext";
import { CANVAS_DIMENSIONS } from "./constants";
import { CanvasEventHandler } from "../../simulation/CanvasEventHandler";
import { CanvasLifecycleManager } from "../../simulation/CanvasLifecycleManager";

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
  const lastSpawnTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();
  const isInitializedRef = useRef(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const currentSettingsRef = useRef(settings);
  const eventHandlerRef = useRef<CanvasEventHandler>();
  const lifecycleManagerRef = useRef<CanvasLifecycleManager>();
  
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: CANVAS_DIMENSIONS.WIDTH,
    height: CANVAS_DIMENSIONS.HEIGHT,
  });

  useEffect(() => {
    currentSettingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (systemRef.current && currentTool === "select") {
        systemRef.current.handleKeyboardShortcut(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    // Initialize managers
    eventHandlerRef.current = new CanvasEventHandler(
      isDrawingRef,
      lastDrawPosRef,
      lastSpawnTimeRef,
      currentSettingsRef,
      systemRef
    );

    lifecycleManagerRef.current = new CanvasLifecycleManager(
      animationFrameRef,
      systemRef,
      isInitializedRef
    );

    lifecycleManagerRef.current.initialize(canvas, setCanvasSize, {
      width: CANVAS_DIMENSIONS.WIDTH,
      height: CANVAS_DIMENSIONS.HEIGHT,
    });

    return () => {
      lifecycleManagerRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current && lifecycleManagerRef.current) {
      lifecycleManagerRef.current.setCursor(canvasRef.current, currentTool);
      lifecycleManagerRef.current.handleToolChange(currentTool);
    }
  }, [currentTool]);

  useEffect(() => {
    if (!lifecycleManagerRef.current) return;
    return lifecycleManagerRef.current.setupAnimation(isPaused, settings);
  }, [isPaused, settings]);

  useEffect(() => {
    if (lifecycleManagerRef.current) {
      lifecycleManagerRef.current.updateColors(settings);
    }
  }, [settings.particleColor, settings.trailColor, settings.backgroundColor]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eventHandlerRef.current || !canvasRef.current) return;
    eventHandlerRef.current.handleMouseDown(
      e,
      currentTool,
      canvasRef.current,
      eraserProperties.size
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eventHandlerRef.current || !canvasRef.current) return;
    eventHandlerRef.current.handleMouseMove(
      e,
      currentTool,
      canvasRef.current,
      eraserProperties.size
    );
  };

  const handleMouseUp = () => {
    if (!eventHandlerRef.current) return;
    eventHandlerRef.current.handleMouseUp(currentTool);
  };

  const handleMouseLeave = handleMouseUp;

  return (
    <div
      ref={canvasWrapperRef}
      className="relative"
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}