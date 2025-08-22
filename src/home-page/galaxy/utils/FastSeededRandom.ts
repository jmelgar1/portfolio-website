/**
 * High-performance seeded random number generator
 * Uses Mulberry32 algorithm which is much faster than our current implementation
 */
export class FastSeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  // Fast seeded random using Mulberry32 algorithm
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Generate n random numbers at once (for bulk operations)
  public nextBatch(count: number): Float32Array {
    const results = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      results[i] = this.next();
    }
    return results;
  }

  // Reset to original seed
  public reset(seed: number): void {
    this.state = seed;
  }
}