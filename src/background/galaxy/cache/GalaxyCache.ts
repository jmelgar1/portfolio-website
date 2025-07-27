import { GalaxyType } from '../config/galaxyConfig';
import { GalaxyPositions } from '../utils/galaxyShapes';
import { generateOptimizedGalaxyShape } from '../utils/OptimizedGalaxyShapes';
import { galaxyWorkerManager } from '../workers/GalaxyWorkerManager';

interface CachedGalaxy {
  type: GalaxyType;
  seed: number;
  galaxy: GalaxyPositions;
  lastUsed: number;
}

class GalaxyCache {
  private cache = new Map<string, CachedGalaxy>();
  private maxSize = 50; // Keep up to 50 pre-computed galaxies
  private preComputeQueue: Array<{ type: GalaxyType; seed: number }> = [];
  private isPreComputing = false;

  // Generate cache key
  private getCacheKey(type: GalaxyType, seed: number): string {
    return `${type}_${seed}`;
  }

  // Get galaxy from cache or generate if not cached
  public getGalaxy(type: GalaxyType, seed: number): GalaxyPositions {
    const key = this.getCacheKey(type, seed);
    const cached = this.cache.get(key);

    if (cached) {
      cached.lastUsed = Date.now();
      return {
        positions: new Float32Array(cached.galaxy.positions),
        colors: new Float32Array(cached.galaxy.colors)
      };
    }

    // Not in cache, generate immediately using optimized function
    console.log(`Cache miss for ${type}:${seed}, generating optimized...`);
    const galaxy = generateOptimizedGalaxyShape(type, seed);
    
    // Add to cache
    this.addToCache(type, seed, galaxy);
    
    return {
      positions: new Float32Array(galaxy.positions),
      colors: new Float32Array(galaxy.colors)
    };
  }

  // Add galaxy to cache
  private addToCache(type: GalaxyType, seed: number, galaxy: GalaxyPositions): void {
    const key = this.getCacheKey(type, seed);
    
    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      type,
      seed,
      galaxy: {
        positions: new Float32Array(galaxy.positions),
        colors: new Float32Array(galaxy.colors)
      },
      lastUsed: Date.now()
    });
  }

  // Remove least recently used galaxy
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.lastUsed < lruTime) {
        lruTime = cached.lastUsed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`Evicted galaxy from cache: ${lruKey}`);
    }
  }

  // Pre-compute galaxies in the background using requestIdleCallback
  public preComputeGalaxies(seeds: Array<{ type: GalaxyType; seed: number }>): void {
    this.preComputeQueue.push(...seeds);
    this.processPreComputeQueue();
  }

  private processPreComputeQueue(): void {
    if (this.isPreComputing || this.preComputeQueue.length === 0) {
      return;
    }

    this.isPreComputing = true;

    const processNext = () => {
      if (this.preComputeQueue.length === 0) {
        this.isPreComputing = false;
        return;
      }

      const { type, seed } = this.preComputeQueue.shift()!;
      const key = this.getCacheKey(type, seed);

      // Skip if already cached
      if (!this.cache.has(key)) {
        try {
          // Try worker first, fallback to main thread
          if (galaxyWorkerManager.isReady()) {
            galaxyWorkerManager.generateGalaxy(type, seed, 3000)
              .then(galaxy => {
                this.addToCache(type, seed, galaxy);
                console.log(`Pre-computed galaxy via worker: ${type}:${seed}`);
              })
              .catch(error => {
                console.warn(`Worker failed for ${type}:${seed}, using main thread:`, error);
                const galaxy = generateOptimizedGalaxyShape(type, seed);
                this.addToCache(type, seed, galaxy);
                console.log(`Pre-computed galaxy via main thread: ${type}:${seed}`);
              });
          } else {
            const galaxy = generateOptimizedGalaxyShape(type, seed);
            this.addToCache(type, seed, galaxy);
            console.log(`Pre-computed galaxy via main thread: ${type}:${seed}`);
          }
        } catch (error) {
          console.error(`Failed to pre-compute galaxy ${type}:${seed}:`, error);
        }
      }

      // Use requestIdleCallback for non-blocking computation
      if ('requestIdleCallback' in window) {
        requestIdleCallback(processNext, { timeout: 100 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(processNext, 16);
      }
    };

    processNext();
  }

  // Pre-compute likely galaxies based on mouse patterns
  public predictAndPreCompute(mouseVelocity: number, mousePosition: { x: number; y: number }): void {
    const types: GalaxyType[] = ['spiral', 'elliptical', 'irregular'];
    const predictedSeeds: Array<{ type: GalaxyType; seed: number }> = [];

    // Generate 10 likely seeds based on current mouse state
    for (let i = 0; i < 10; i++) {
      const now = Date.now() + i * 1000; // Simulate future timestamps
      const mouseSeed = Math.floor((mousePosition.x * 1000 + mousePosition.y * 1000) * 100) % 10000;
      const velocitySeed = Math.floor(mouseVelocity * 100) % 1000;
      const timeSeed = now % 10000;
      const uniqueSeed = (mouseSeed + velocitySeed * 17 + timeSeed * 31) % 100000;

      types.forEach(type => {
        predictedSeeds.push({ type, seed: uniqueSeed + type.length * i });
      });
    }

    this.preComputeGalaxies(predictedSeeds);
  }

  // Check if galaxy exists in cache
  public isGalaxyCached(type: GalaxyType, seed: number): boolean {
    return this.cache.has(this.getCacheKey(type, seed));
  }

  // Get cache statistics
  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Could implement hit rate tracking if needed
    };
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
    this.preComputeQueue.length = 0;
    this.isPreComputing = false;
  }
}

// Export singleton instance
export const galaxyCache = new GalaxyCache();