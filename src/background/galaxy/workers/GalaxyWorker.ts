// Galaxy Worker for off-main-thread galaxy generation
import { GalaxyType } from '../config/galaxyConfig';
import { generateOptimizedGalaxyShape } from '../utils/OptimizedGalaxyShapes';

export interface WorkerMessage {
  id: string;
  type: 'generate';
  data: {
    galaxyType: GalaxyType;
    seed: number;
  };
}

export interface WorkerResponse {
  id: string;
  type: 'generated' | 'error';
  data: {
    galaxyType: GalaxyType;
    seed: number;
    positions?: Float32Array;
    colors?: Float32Array;
    error?: string;
  };
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { id, type, data } = e.data;
  
  try {
    if (type === 'generate') {
      const { galaxyType, seed } = data;
      
      // Generate the galaxy using optimized function
      const galaxy = generateOptimizedGalaxyShape(galaxyType, seed);
      
      // Send result back to main thread
      const response: WorkerResponse = {
        id,
        type: 'generated',
        data: {
          galaxyType,
          seed,
          positions: galaxy.positions,
          colors: galaxy.colors
        }
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    // Send error back to main thread
    const response: WorkerResponse = {
      id,
      type: 'error',
      data: {
        galaxyType: data.galaxyType,
        seed: data.seed,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    
    self.postMessage(response);
  }
};