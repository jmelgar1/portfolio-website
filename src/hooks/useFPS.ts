import { useState, useEffect, useRef } from 'react';

interface FPSData {
  fps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameCount: number;
}

export const useFPS = (updateInterval: number = 1000): FPSData => {
  const [fpsData, setFpsData] = useState<FPSData>({
    fps: 0,
    averageFps: 0,
    minFps: Infinity,
    maxFps: 0,
    frameCount: 0,
  });

  const frameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const minFpsRef = useRef<number>(Infinity);
  const maxFpsRef = useRef<number>(0);

  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Calculate time since last update
      const timeSinceUpdate = now - lastUpdateRef.current;
      
      if (timeSinceUpdate >= updateInterval) {
        // Calculate current FPS
        const currentFPS = (frameCountRef.current * 1000) / timeSinceUpdate;
        
        // Update FPS history for average calculation
        fpsHistoryRef.current.push(currentFPS);
        if (fpsHistoryRef.current.length > 60) { // Keep last 60 samples
          fpsHistoryRef.current.shift();
        }
        
        // Calculate average FPS
        const averageFPS = fpsHistoryRef.current.reduce((sum, fps) => sum + fps, 0) / fpsHistoryRef.current.length;
        
        // Update min/max FPS
        if (currentFPS < minFpsRef.current) {
          minFpsRef.current = currentFPS;
        }
        if (currentFPS > maxFpsRef.current) {
          maxFpsRef.current = currentFPS;
        }
        
        // Update state
        setFpsData({
          fps: Math.round(currentFPS),
          averageFps: Math.round(averageFPS),
          minFps: Math.round(minFpsRef.current),
          maxFps: Math.round(maxFpsRef.current),
          frameCount: frameCountRef.current,
        });
        
        // Reset counters
        frameCountRef.current = 0;
        lastUpdateRef.current = now;
      }
      
      frameRef.current = requestAnimationFrame(updateFPS);
    };

    frameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateInterval]);

  return fpsData;
};