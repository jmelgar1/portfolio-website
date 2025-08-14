import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import MountainTerrain from '../MountainTerrain';
import TerrainDebugOverlay from '../TerrainDebugOverlay';
import { 
  calculateViewportBounds, 
  calculateTerrainMetrics, 
  validateTerrainOptimization 
} from './TerrainOptimizationTest';

/**
 * Regression tests to ensure terrain optimization remains effective
 * and doesn't degrade over time with code changes.
 */

describe('Mountain Terrain Regression Tests', () => {
  // Baseline expectations based on optimization analysis
  const EXPECTED_VIEWPORT_WIDTH = 110.46;
  const EXPECTED_VIEWPORT_HEIGHT = 62.13;
  const MINIMUM_COVERAGE_THRESHOLD = 0.8;
  const CURRENT_TERRAIN_WIDTH = 120;

  describe('Viewport Calculation Consistency', () => {
    it('should maintain consistent viewport calculations', () => {
      const bounds = calculateViewportBounds([0, 0, 5], -70, 45, 16/9);
      
      // These values should remain stable across code changes
      expect(bounds.visibleWidth).toBeCloseTo(EXPECTED_VIEWPORT_WIDTH, 1);
      expect(bounds.visibleHeight).toBeCloseTo(EXPECTED_VIEWPORT_HEIGHT, 1);
      expect(bounds.left).toBeCloseTo(-EXPECTED_VIEWPORT_WIDTH/2, 1);
      expect(bounds.right).toBeCloseTo(EXPECTED_VIEWPORT_WIDTH/2, 1);
    });

    it('should handle aspect ratio variations correctly', () => {
      const ultrawide = calculateViewportBounds([0, 0, 5], -70, 45, 21/9);
      const standard = calculateViewportBounds([0, 0, 5], -70, 45, 16/9);
      const mobile = calculateViewportBounds([0, 0, 5], -70, 45, 9/16);

      expect(ultrawide.visibleWidth).toBeGreaterThan(standard.visibleWidth);
      expect(mobile.visibleWidth).toBeLessThan(standard.visibleWidth);
      
      // Height should remain the same regardless of aspect ratio
      expect(ultrawide.visibleHeight).toBeCloseTo(standard.visibleHeight, 1);
      expect(mobile.visibleHeight).toBeCloseTo(standard.visibleHeight, 1);
    });
  });

  describe('Terrain Optimization Compliance', () => {
    it('should maintain optimal terrain coverage', () => {
      const viewportBounds = calculateViewportBounds();
      const terrainMetrics = calculateTerrainMetrics(
        CURRENT_TERRAIN_WIDTH,
        300,
        92,
        [0, -60, -70]
      );

      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      expect(validation.coverage).toBeGreaterThanOrEqual(MINIMUM_COVERAGE_THRESHOLD);
      expect(validation.horizontalEfficiency).toBeGreaterThanOrEqual(MINIMUM_COVERAGE_THRESHOLD);
      expect(validation.isOptimal).toBe(true);
      
      // Should have no optimization recommendations
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should prevent regression to wasteful configurations', () => {
      const viewportBounds = calculateViewportBounds();
      const inefficientMetrics = calculateTerrainMetrics(
        450, // Original wasteful width
        300,
        92,
        [0, -60, -70]
      );

      const validation = validateTerrainOptimization(inefficientMetrics, viewportBounds);

      // This should fail optimization checks
      expect(validation.isOptimal).toBe(false);
      expect(validation.horizontalEfficiency).toBeLessThan(MINIMUM_COVERAGE_THRESHOLD);
      expect(validation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration Stability', () => {
    it('should render MountainTerrain without errors', () => {
      const TestCanvas = () => (
        <Canvas>
          <MountainTerrain 
            position={[0, -60, -70]}
            width={120}
            length={300}
            segments={92}
          />
        </Canvas>
      );

      expect(() => render(<TestCanvas />)).not.toThrow();
    });

    it('should render TerrainDebugOverlay without errors', () => {
      const TestCanvas = () => (
        <Canvas>
          <TerrainDebugOverlay
            camera={{ position: [0, 0, 5], fov: 45 }}
            terrain={{ position: [0, -60, -70], width: 120, length: 300 }}
          />
        </Canvas>
      );

      expect(() => render(<TestCanvas />)).not.toThrow();
    });
  });

  describe('Performance Regression Prevention', () => {
    it('should maintain reasonable geometry complexity', () => {
      const metrics = calculateTerrainMetrics(120, 300, 92);
      
      // Ensure vertex count doesn't accidentally increase
      const expectedVertexCount = (92 + 1) * (92 + 1); // 8649
      expect(metrics.vertexCount).toBe(expectedVertexCount);
      
      // Memory usage should be predictable
      expect(metrics.estimatedMemoryUsage).toBeLessThan(1000000); // 1MB limit
    });

    it('should prevent excessive segment count creep', () => {
      // Test that default segments remain reasonable
      const lowDetail = calculateTerrainMetrics(120, 300, 50);
      const currentDetail = calculateTerrainMetrics(120, 300, 92);
      const highDetail = calculateTerrainMetrics(120, 300, 150);

      // Ensure current detail level is justified
      expect(currentDetail.vertexCount).toBeGreaterThan(lowDetail.vertexCount);
      expect(highDetail.vertexCount).toBeGreaterThan(currentDetail.vertexCount * 2);
      
      // Current detail should be in reasonable range
      expect(currentDetail.vertexCount).toBeLessThan(10000);
    });
  });

  describe('Camera Configuration Stability', () => {
    it('should handle standard camera configurations', () => {
      const configs = [
        { position: [0, 0, 5], fov: 45, aspect: 16/9 },
        { position: [0, 0, 10], fov: 60, aspect: 16/9 },
        { position: [5, 5, 5], fov: 30, aspect: 4/3 }
      ];

      configs.forEach(config => {
        const bounds = calculateViewportBounds(
          config.position as [number, number, number],
          -70,
          config.fov,
          config.aspect
        );

        expect(bounds.visibleWidth).toBeGreaterThan(0);
        expect(bounds.visibleHeight).toBeGreaterThan(0);
        expect(bounds.left).toBeLessThan(bounds.right);
        expect(bounds.bottom).toBeLessThan(bounds.top);
      });
    });
  });

  describe('Edge Case Stability', () => {
    it('should handle extreme terrain positions', () => {
      const extremePositions: [number, number, number][] = [
        [0, -100, -70], // Very low Y
        [50, -60, -70], // Offset X
        [0, -60, -200]  // Very far Z
      ];

      extremePositions.forEach(position => {
        const metrics = calculateTerrainMetrics(120, 300, 92, position);
        expect(metrics.terrainPosition).toEqual(position);
        expect(metrics.vertexCount).toBeGreaterThan(0);
      });
    });

    it('should handle small terrain dimensions gracefully', () => {
      const validation = validateTerrainOptimization(
        calculateTerrainMetrics(10, 10, 5, [0, -60, -70]),
        calculateViewportBounds()
      );

      // Should handle gracefully even if not optimal
      expect(validation.coverage).toBeGreaterThanOrEqual(0);
      expect(validation.verticalWaste).toBeGreaterThanOrEqual(0);
      expect(validation.recommendations).toBeDefined();
    });
  });

  describe('Mathematical Consistency', () => {
    it('should maintain consistent trigonometric calculations', () => {
      // Test FOV to viewport size conversion accuracy
      const testCases = [
        { fov: 30, expectedMultiplier: Math.tan(15 * Math.PI / 180) },
        { fov: 45, expectedMultiplier: Math.tan(22.5 * Math.PI / 180) },
        { fov: 60, expectedMultiplier: Math.tan(30 * Math.PI / 180) }
      ];

      testCases.forEach(({ fov, expectedMultiplier }) => {
        const bounds = calculateViewportBounds([0, 0, 0], -75, fov, 1);
        const actualMultiplier = bounds.visibleHeight / (2 * 75);
        
        expect(actualMultiplier).toBeCloseTo(expectedMultiplier, 3);
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should validate current production configuration meets all criteria', () => {
      // This is the critical test - current config must always pass
      const viewportBounds = calculateViewportBounds([0, 0, 5], -70, 45, 16/9);
      const terrainMetrics = calculateTerrainMetrics(120, 300, 92, [0, -60, -70]);
      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      // All optimization goals must be met
      expect(validation.isOptimal).toBe(true);
      expect(validation.coverage).toBeGreaterThan(MINIMUM_COVERAGE_THRESHOLD);
      expect(validation.horizontalEfficiency).toBeGreaterThan(MINIMUM_COVERAGE_THRESHOLD);
      expect(validation.recommendations).toHaveLength(0);
      
      // Specific coverage expectations
      expect(validation.coverage).toBeCloseTo(1.0, 1); // Near-perfect coverage
      expect(validation.horizontalEfficiency).toBeCloseTo(0.92, 1); // Very efficient width usage
    });
  });
});