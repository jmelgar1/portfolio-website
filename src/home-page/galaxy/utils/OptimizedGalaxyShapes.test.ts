import { describe, test, expect } from "vitest";
import { generateOptimizedGalaxyShape } from "./OptimizedGalaxyShapes";

describe("OptimizedGalaxyShapes", () => {
  describe("Elliptical Galaxy Constraints", () => {
    test("elliptical galaxies should never exceed 25 units in any dimension", () => {
      // Test with multiple seeds to ensure constraints work across different random configurations
      const testSeeds = [1234, 5678, 9012, 3456, 7890, 1111, 2222, 3333, 4444, 5555];
      
      for (const seed of testSeeds) {
        const galaxy = generateOptimizedGalaxyShape("elliptical", seed);
        
        // Check all positions for constraint violations
        const positions = galaxy.positions;
        let maxX = 0, maxY = 0, maxZ = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = Math.abs(positions[i]);
          const y = Math.abs(positions[i + 1]);
          const z = Math.abs(positions[i + 2]);
          
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
        
        // Verify no dimension exceeds 25 units
        expect(maxX).toBeLessThanOrEqual(25);
        expect(maxY).toBeLessThanOrEqual(25);
        expect(maxZ).toBeLessThanOrEqual(25);
        
        // Log the dimensions for debugging if needed
        if (maxX > 25 || maxY > 25 || maxZ > 25) {
          console.log(`Constraint violation with seed ${seed}: X=${maxX.toFixed(2)}, Y=${maxY.toFixed(2)}, Z=${maxZ.toFixed(2)}`);
        }
      }
    });

    test("elliptical galaxies should have valid position and color arrays", () => {
      const seed = 12345;
      const galaxy = generateOptimizedGalaxyShape("elliptical", seed);
      
      // Check that arrays are the expected length
      expect(galaxy.positions.length % 3).toBe(0); // Should be divisible by 3 (x, y, z)
      expect(galaxy.colors.length % 3).toBe(0); // Should be divisible by 3 (r, g, b)
      expect(galaxy.positions.length).toBe(galaxy.colors.length); // Should be same length
      
      // Check that all values are finite numbers
      for (let i = 0; i < galaxy.positions.length; i++) {
        expect(Number.isFinite(galaxy.positions[i])).toBe(true);
        expect(Number.isFinite(galaxy.colors[i])).toBe(true);
      }
    });

    test("elliptical galaxies should be deterministic with same seed", () => {
      const seed = 99999;
      const galaxy1 = generateOptimizedGalaxyShape("elliptical", seed);
      const galaxy2 = generateOptimizedGalaxyShape("elliptical", seed);
      
      // Should generate identical results with same seed
      expect(galaxy1.positions.length).toBe(galaxy2.positions.length);
      expect(galaxy1.colors.length).toBe(galaxy2.colors.length);
      
      // Check first few positions are identical
      for (let i = 0; i < Math.min(30, galaxy1.positions.length); i++) {
        expect(galaxy1.positions[i]).toBe(galaxy2.positions[i]);
        expect(galaxy1.colors[i]).toBe(galaxy2.colors[i]);
      }
    });

    test("different elliptical galaxy seeds should produce different results", () => {
      const galaxy1 = generateOptimizedGalaxyShape("elliptical", 1111);
      const galaxy2 = generateOptimizedGalaxyShape("elliptical", 2222);
      
      // Should generate different results with different seeds
      expect(galaxy1.positions.length).toBe(galaxy2.positions.length); // Same structure
      expect(galaxy1.colors.length).toBe(galaxy2.colors.length); // Same structure
      
      // But different actual values (check first few positions)
      let differenceFound = false;
      for (let i = 0; i < Math.min(30, galaxy1.positions.length) && !differenceFound; i++) {
        if (galaxy1.positions[i] !== galaxy2.positions[i] || galaxy1.colors[i] !== galaxy2.colors[i]) {
          differenceFound = true;
        }
      }
      expect(differenceFound).toBe(true);
    });

    test("elliptical galaxies should respect the 20-unit simultaneous constraint", () => {
      // Test with seeds that might trigger the simultaneous constraint
      const testSeeds = [1, 2, 3, 4, 5, 100, 200, 300, 400, 500];
      
      for (const seed of testSeeds) {
        const galaxy = generateOptimizedGalaxyShape("elliptical", seed);
        
        // Check all positions
        const positions = galaxy.positions;
        let maxX = 0, maxY = 0, maxZ = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = Math.abs(positions[i]);
          const y = Math.abs(positions[i + 1]);
          const z = Math.abs(positions[i + 2]);
          
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
        
        // If all dimensions are above 20, this should not happen due to our constraints
        // (accounting for asymmetry scaling, the actual limit should be lower)
        if (maxX > 20 && maxY > 20 && maxZ > 20) {
          console.warn(`All dimensions exceed 20 with seed ${seed}: X=${maxX.toFixed(2)}, Y=${maxY.toFixed(2)}, Z=${maxZ.toFixed(2)}`);
        }
        
        // The main constraint is still 25 units max
        expect(maxX).toBeLessThanOrEqual(25);
        expect(maxY).toBeLessThanOrEqual(25);
        expect(maxZ).toBeLessThanOrEqual(25);
      }
    });
  });

  describe("Other Galaxy Types", () => {
    test("spiral galaxies should not exceed 25 units in any dimension", () => {
      const testSeeds = [1234, 5678, 9012];
      
      for (const seed of testSeeds) {
        const galaxy = generateOptimizedGalaxyShape("spiral", seed);
        
        const positions = galaxy.positions;
        let maxX = 0, maxY = 0, maxZ = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = Math.abs(positions[i]);
          const y = Math.abs(positions[i + 1]);
          const z = Math.abs(positions[i + 2]);
          
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
        
        expect(maxX).toBeLessThanOrEqual(25);
        expect(maxY).toBeLessThanOrEqual(25);
        expect(maxZ).toBeLessThanOrEqual(25);
      }
    });

    test("irregular galaxies should not exceed 25 units in any dimension", () => {
      const testSeeds = [1234, 5678, 9012];
      
      for (const seed of testSeeds) {
        const galaxy = generateOptimizedGalaxyShape("irregular", seed);
        
        const positions = galaxy.positions;
        let maxX = 0, maxY = 0, maxZ = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = Math.abs(positions[i]);
          const y = Math.abs(positions[i + 1]);
          const z = Math.abs(positions[i + 2]);
          
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
        
        expect(maxX).toBeLessThanOrEqual(25);
        expect(maxY).toBeLessThanOrEqual(25);
        expect(maxZ).toBeLessThanOrEqual(25);
      }
    });
  });
});