/**
 * React hook for managing terrain worker communication
 * Provides a clean interface for offloading terrain generation to Web Worker
 */

import { useCallback, useRef, useEffect } from 'react';
import { TerrainWorkerInput, TerrainWorkerMessage, TerrainWorkerResponse, TerrainWorkerResult } from './terrainWorker.types';

export interface UseTerrainWorkerResult {
  generateTerrain: (input: TerrainWorkerInput) => Promise<TerrainWorkerResult>;
  isWorkerReady: boolean;
  cleanup: () => void;
}

export const useTerrainWorker = (): UseTerrainWorkerResult => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestsRef = useRef<Map<string, {
    resolve: (result: TerrainWorkerResult) => void;
    reject: (error: Error) => void;
  }>>(new Map());
  const isWorkerReadyRef = useRef(false);
  const initializationAttemptedRef = useRef(false);

  // Initialize worker
  useEffect(() => {
    if (initializationAttemptedRef.current) return;
    initializationAttemptedRef.current = true;
    
    try {
      // Create worker from TypeScript file (Vite will handle the compilation)
      // Use the ?worker suffix to tell Vite to bundle this as a worker
      workerRef.current = new Worker(
        new URL('./terrainWorker.ts?worker', import.meta.url)
      );
      
      // Handle worker messages
      workerRef.current.onmessage = (event: MessageEvent<TerrainWorkerResponse>) => {
        const { type, payload, id } = event.data;
        
        const pendingRequest = pendingRequestsRef.current.get(id);
        if (!pendingRequest) return;
        
        pendingRequestsRef.current.delete(id);
        
        if (type === 'TERRAIN_GENERATED') {
          pendingRequest.resolve(payload as TerrainWorkerResult);
        } else if (type === 'TERRAIN_ERROR') {
          const errorPayload = payload as { error: string };
          pendingRequest.reject(new Error(errorPayload.error));
        }
      };
      
      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Terrain worker error:', error);
        // Reject all pending requests
        pendingRequestsRef.current.forEach(({ reject }) => {
          reject(new Error('Worker encountered an error'));
        });
        pendingRequestsRef.current.clear();
        isWorkerReadyRef.current = false;
      };
      
      isWorkerReadyRef.current = true;
      
    } catch (error) {
      console.error('Failed to create terrain worker:', error);
      isWorkerReadyRef.current = false;
    }

    return () => {
      cleanup();
    };
  }, []);

  const generateTerrain = useCallback((input: TerrainWorkerInput): Promise<TerrainWorkerResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isWorkerReadyRef.current) {
        reject(new Error('Terrain worker is not ready'));
        return;
      }

      // Generate unique ID for this request
      const id = `terrain_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store promise callbacks for this request
      pendingRequestsRef.current.set(id, { resolve, reject });
      
      // Send message to worker
      const message: TerrainWorkerMessage = {
        type: 'GENERATE_TERRAIN',
        payload: input,
        id
      };
      
      workerRef.current.postMessage(message);
      
      // Set timeout for request (10 seconds)
      setTimeout(() => {
        const pendingRequest = pendingRequestsRef.current.get(id);
        if (pendingRequest) {
          pendingRequestsRef.current.delete(id);
          pendingRequest.reject(new Error('Terrain generation timed out'));
        }
      }, 10000);
    });
  }, []);

  const cleanup = useCallback(() => {
    // Reject all pending requests
    pendingRequestsRef.current.forEach(({ reject }) => {
      reject(new Error('Worker is being terminated'));
    });
    pendingRequestsRef.current.clear();
    
    // Terminate worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    isWorkerReadyRef.current = false;
  }, []);

  return {
    generateTerrain,
    isWorkerReady: isWorkerReadyRef.current,
    cleanup
  };
};