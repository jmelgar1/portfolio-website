import { GalaxyType } from '../config/galaxyConfig';
import { GalaxyPositions } from '../utils/galaxyShapes';

interface PendingRequest {
  resolve: (galaxy: GalaxyPositions) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class GalaxyWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private isInitialized = false;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      // Create worker from URL - this is a fallback for when worker files aren't properly bundled
      const workerCode = `
        // Embedded worker code
        import { GalaxyType } from '../config/galaxyConfig';
        
        // Fast seeded random (Mulberry32)
        class FastSeededRandom {
          constructor(seed) { this.state = seed; }
          next() {
            let t = (this.state += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          }
        }
        
        // Simplified galaxy generation for worker
        function generateWorkerGalaxy(type, seed) {
          const NUM_STARS = 50000;
          const positions = new Float32Array(NUM_STARS * 3);
          const colors = new Float32Array(NUM_STARS * 3);
          const rng = new FastSeededRandom(seed);
          
          if (type === 'spiral') {
            const armCount = Math.floor(rng.next() * 8) + 3;
            const spiralTightness = rng.next() * 1.2 + 0.8;
            
            for (let i = 0; i < NUM_STARS; i++) {
              const i3 = i * 3;
              const armIndex = i % armCount;
              const branchAngle = (armIndex / armCount) * Math.PI * 2;
              const radius = Math.pow(rng.next(), 2) * 8;
              const spin = radius * 1.5 * spiralTightness;
              
              positions[i3] = Math.cos(branchAngle + spin) * radius;
              positions[i3 + 1] = (rng.next() - 0.5) * 2;
              positions[i3 + 2] = Math.sin(branchAngle + spin) * radius;
              
              colors[i3] = 1.0; colors[i3 + 1] = 0.84; colors[i3 + 2] = 0.0;
            }
          } else if (type === 'elliptical') {
            for (let i = 0; i < NUM_STARS; i++) {
              const i3 = i * 3;
              const phi = rng.next() * Math.PI * 2;
              const cosTheta = (rng.next() - 0.5) * 2;
              const r = Math.pow(rng.next(), 0.5) * 8;
              
              positions[i3] = r * Math.cos(phi) * 2;
              positions[i3 + 1] = r * cosTheta * 0.5;
              positions[i3 + 2] = r * Math.sin(phi) * 2;
              
              colors[i3] = 1.0; colors[i3 + 1] = 0.65; colors[i3 + 2] = 0.0;
            }
          } else {
            for (let i = 0; i < NUM_STARS; i++) {
              const i3 = i * 3;
              positions[i3] = (rng.next() - 0.5) * 8;
              positions[i3 + 1] = (rng.next() - 0.5) * 4;
              positions[i3 + 2] = (rng.next() - 0.5) * 8;
              
              colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0;
            }
          }
          
          return { positions, colors };
        }
        
        self.onmessage = function(e) {
          const { id, type, data } = e.data;
          
          try {
            if (type === 'generate') {
              const { galaxyType, seed } = data;
              const galaxy = generateWorkerGalaxy(galaxyType, seed);
              
              self.postMessage({
                id,
                type: 'generated',
                data: { galaxyType, seed, positions: galaxy.positions, colors: galaxy.colors }
              });
            }
          } catch (error) {
            self.postMessage({
              id,
              type: 'error',
              data: { galaxyType: data.galaxyType, seed: data.seed, error: error.message }
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e) => {
        const { id, type, data } = e.data;
        const pending = this.pendingRequests.get(id);
        
        if (!pending) return;
        
        this.pendingRequests.delete(id);
        
        if (type === 'generated') {
          pending.resolve({
            positions: data.positions,
            colors: data.colors
          });
        } else if (type === 'error') {
          pending.reject(new Error(data.error));
        }
      };

      this.worker.onerror = (error) => {
        console.error('Galaxy worker error:', error);
        this.cleanup();
      };

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize galaxy worker:', error);
      this.isInitialized = false;
    }
  }

  public generateGalaxy(type: GalaxyType, seed: number, timeout: number = 5000): Promise<GalaxyPositions> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.worker) {
        reject(new Error('Galaxy worker not initialized'));
        return;
      }

      const id = `galaxy_${++this.requestCounter}_${Date.now()}`;
      
      // Store the request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Galaxy generation timeout'));
        }
      }, timeout);

      // Send request to worker
      this.worker.postMessage({
        id,
        type: 'generate',
        data: { galaxyType: type, seed }
      });
    });
  }

  public cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    // Reject all pending requests
    for (const [, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
    
    this.isInitialized = false;
  }

  public isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

// Export singleton instance
export const galaxyWorkerManager = new GalaxyWorkerManager();