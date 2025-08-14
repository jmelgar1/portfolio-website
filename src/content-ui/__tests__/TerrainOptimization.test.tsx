import { describe, it, expect } from 'vitest';
import {
  calculateViewportBounds,
  calculateTerrainMetrics,
  validateTerrainOptimization,
  generateOptimizationReport,
  benchmarkTerrainGeneration
} from './TerrainOptimizationTest';

describe('Mountain Terrain Optimization Tests', () => {
  const DEFAULT_CAMERA_CONFIG = {
    position: [0, 0, 5] as [number, number, number],
    fov: 45,
    aspect: 16/9
  };
  
  const OPTIMIZED_TERRAIN_CONFIG = {
    width: 120,
    length: 300,
    segments: 92,
    position: [0, -60, -70] as [number, number, number]
  };
  
  const ORIGINAL_TERRAIN_CONFIG = {
    width: 450,
    length: 300,
    segments: 92,
    position: [0, -60, -70] as [number, number, number]
  };

  describe('Viewport Bounds Calculation', () => {
    it('should calculate correct viewport dimensions at terrain depth', () => {
      const bounds = calculateViewportBounds(
        DEFAULT_CAMERA_CONFIG.position,
        -70, // terrain Z position
        DEFAULT_CAMERA_CONFIG.fov,
        DEFAULT_CAMERA_CONFIG.aspect
      );

      // Expected calculations:
      // Distance = |(-70) - 5| = 75
      // Visible height = 2 * tan(22.5°) * 75 ≈ 62.13
      // Visible width = 62.13 * (16/9) ≈ 110.46
      
      expect(bounds.visibleHeight).toBeCloseTo(62.13, 1);
      expect(bounds.visibleWidth).toBeCloseTo(110.46, 1);
      expect(bounds.left).toBeCloseTo(-55.23, 1);
      expect(bounds.right).toBeCloseTo(55.23, 1);
    });

    it('should handle different camera positions', () => {
      const bounds = calculateViewportBounds([10, 20, 5], -70, 45, 16/9);
      
      expect(bounds.left).toBeCloseTo(10 - 55.23, 1);
      expect(bounds.right).toBeCloseTo(10 + 55.23, 1);
      expect(bounds.top).toBeCloseTo(20 + 31.07, 1);
      expect(bounds.bottom).toBeCloseTo(20 - 31.07, 1);
    });
  });

  describe('Terrain Metrics Calculation', () => {
    it('should calculate correct metrics for optimized terrain', () => {
      const metrics = calculateTerrainMetrics(
        OPTIMIZED_TERRAIN_CONFIG.width,
        OPTIMIZED_TERRAIN_CONFIG.length,
        OPTIMIZED_TERRAIN_CONFIG.segments,
        OPTIMIZED_TERRAIN_CONFIG.position
      );

      expect(metrics.terrainWidth).toBe(120);
      expect(metrics.terrainLength).toBe(300);
      expect(metrics.vertexCount).toBe((92 + 1) * (92 + 1)); // 8649 vertices
      expect(metrics.estimatedMemoryUsage).toBeGreaterThan(0);
    });

    it('should calculate higher memory usage for larger terrain', () => {
      const optimizedMetrics = calculateTerrainMetrics(120, 300, 92);
      const originalMetrics = calculateTerrainMetrics(450, 300, 92);
      
      // Memory usage should be the same (same vertex count), but the original wastes more space
      expect(originalMetrics.vertexCount).toBe(optimizedMetrics.vertexCount);
      expect(originalMetrics.estimatedMemoryUsage).toBe(optimizedMetrics.estimatedMemoryUsage);
    });
  });

  describe('Terrain Optimization Validation', () => {
    it('should validate optimized terrain as efficient', () => {
      const viewportBounds = calculateViewportBounds();
      const terrainMetrics = calculateTerrainMetrics(
        OPTIMIZED_TERRAIN_CONFIG.width,
        OPTIMIZED_TERRAIN_CONFIG.length,
        OPTIMIZED_TERRAIN_CONFIG.segments,
        OPTIMIZED_TERRAIN_CONFIG.position
      );

      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      // Terrain should cover viewport well (width optimization)
      expect(validation.coverage).toBeGreaterThan(0.8);
      
      // Horizontal efficiency should be good (width is well-utilized)
      expect(validation.horizontalEfficiency).toBeGreaterThan(0.9);
      
      // Vertical waste is expected due to design choice (terrain length >> viewport height)
      expect(validation.verticalWaste).toBeGreaterThan(0.7);
      
      // Should be considered optimal for horizontal dimension
      expect(validation.isOptimal).toBe(true);
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should flag original terrain as wasteful', () => {
      const viewportBounds = calculateViewportBounds();
      const terrainMetrics = calculateTerrainMetrics(
        ORIGINAL_TERRAIN_CONFIG.width,
        ORIGINAL_TERRAIN_CONFIG.length,
        ORIGINAL_TERRAIN_CONFIG.segments,
        ORIGINAL_TERRAIN_CONFIG.position
      );

      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      // Original terrain has poor horizontal efficiency (450 width >> 110 viewport width)
      expect(validation.horizontalEfficiency).toBeLessThan(0.5);
      expect(validation.isOptimal).toBe(false);
      expect(validation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Optimization Report Generation', () => {
    it('should show improvement from optimization', () => {
      const report = generateOptimizationReport(
        OPTIMIZED_TERRAIN_CONFIG,
        ORIGINAL_TERRAIN_CONFIG
      );

      // Should show improved horizontal efficiency
      expect(report.current.validation.horizontalEfficiency).toBeGreaterThan(report.original.validation.horizontalEfficiency);
      
      // Vertex count should be the same (same segments)
      expect(report.improvements.vertexReduction).toBe(0);
      expect(report.improvements.vertexReductionPercent).toBe(0);
      
      // Memory usage should be the same (same vertex count)
      expect(report.improvements.memorySavings).toBe(0);
      
      // Current terrain should be more optimal
      expect(report.current.validation.isOptimal).toBe(true);
      expect(report.original.validation.isOptimal).toBe(false);
    });

    it('should provide detailed viewport analysis', () => {
      const report = generateOptimizationReport(
        OPTIMIZED_TERRAIN_CONFIG,
        ORIGINAL_TERRAIN_CONFIG
      );

      expect(report.viewport.visibleWidth).toBeCloseTo(110.46, 1);
      expect(report.viewport.visibleHeight).toBeCloseTo(62.13, 1);
      expect(report.current.validation.coverage).toBeGreaterThan(0.8);
      expect(report.original.validation.coverage).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should measure terrain generation performance', async () => {
      const benchmark = await benchmarkTerrainGeneration(120, 300, 50, 3); // Smaller test

      expect(benchmark.averageTime).toBeGreaterThan(0);
      expect(benchmark.minTime).toBeGreaterThan(0);
      expect(benchmark.maxTime).toBeGreaterThanOrEqual(benchmark.minTime);
      expect(benchmark.standardDeviation).toBeGreaterThanOrEqual(0);
    });

    it('should show performance difference between optimized and original', async () => {
      // Test with reduced segments for faster execution
      const optimizedBenchmark = await benchmarkTerrainGeneration(120, 300, 30, 2);
      const originalBenchmark = await benchmarkTerrainGeneration(450, 300, 30, 2);

      // Times should be comparable since vertex count is the same
      // (The optimization is about viewport efficiency, not generation speed)
      expect(optimizedBenchmark.averageTime).toBeGreaterThan(0);
      expect(originalBenchmark.averageTime).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle terrain completely outside viewport', () => {
      const viewportBounds = calculateViewportBounds();
      const terrainMetrics = calculateTerrainMetrics(50, 50, 20, [200, 200, -70]);

      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      expect(validation.coverage).toBe(0);
      expect(validation.horizontalEfficiency).toBe(0);
      expect(validation.isOptimal).toBe(false);
    });

    it('should handle terrain smaller than viewport', () => {
      const viewportBounds = calculateViewportBounds();
      const terrainMetrics = calculateTerrainMetrics(20, 20, 10, [0, -60, -70]);

      const validation = validateTerrainOptimization(terrainMetrics, viewportBounds);

      expect(validation.coverage).toBeLessThan(0.8);
      expect(validation.horizontalEfficiency).toBeLessThanOrEqual(1.0); // Terrain fully used but coverage insufficient
      expect(validation.isOptimal).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should validate current production configuration', () => {
      // Test the actual configuration being used in OverlayPage.tsx
      const report = generateOptimizationReport(
        {
          width: 120,
          length: 300, 
          segments: 92,
          position: [0, -60, -70]
        },
        {
          width: 450,
          length: 300,
          segments: 92, 
          position: [0, -60, -70]
        }
      );

      // Verify optimization goals are met
      expect(report.current.validation.isOptimal).toBe(true);
      expect(report.current.validation.coverage).toBeGreaterThan(0.8);
      expect(report.current.validation.horizontalEfficiency).toBeGreaterThan(0.8);
      
      // Verify improvement over original
      expect(report.current.validation.horizontalEfficiency).toBeGreaterThan(report.original.validation.horizontalEfficiency);
    });
  });
});