import * as THREE from 'three';

/**
 * Utility functions for testing Mountain Terrain viewport optimization
 * 
 * CONTEXT: Terrain was reduced from 450 to 120 units width to eliminate
 * geometry generation outside the viewport, improving performance.
 * 
 * Camera config: position=[0,0,5], FOV=45°, terrain at [0,-60,-70]
 */

export interface ViewportBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  visibleWidth: number;
  visibleHeight: number;
}

export interface TerrainMetrics {
  terrainWidth: number;
  terrainLength: number;
  terrainPosition: [number, number, number];
  segmentCount: number;
  vertexCount: number;
  estimatedMemoryUsage: number;
}

/**
 * Calculate the visible viewport bounds at the terrain's Z-depth
 */
export const calculateViewportBounds = (
  cameraPosition: [number, number, number] = [0, 0, 5],
  terrainZ: number = -70,
  fov: number = 45,
  aspect: number = 16/9
): ViewportBounds => {
  const distance = Math.abs(terrainZ - cameraPosition[2]);
  const fovRadians = (fov * Math.PI) / 180;
  
  // Calculate visible dimensions at terrain depth
  const visibleHeight = 2 * Math.tan(fovRadians / 2) * distance;
  const visibleWidth = visibleHeight * aspect;
  
  // Calculate bounds relative to camera center
  const left = cameraPosition[0] - visibleWidth / 2;
  const right = cameraPosition[0] + visibleWidth / 2;
  const top = cameraPosition[1] + visibleHeight / 2;
  const bottom = cameraPosition[1] - visibleHeight / 2;
  
  return {
    left,
    right,
    top,
    bottom,
    visibleWidth,
    visibleHeight
  };
};

/**
 * Calculate terrain geometry metrics
 */
export const calculateTerrainMetrics = (
  width: number = 120,
  length: number = 300,
  segments: number = 92,
  position: [number, number, number] = [0, -60, -70]
): TerrainMetrics => {
  const vertexCount = (segments + 1) * (segments + 1);
  
  // Estimate memory usage (positions, normals, colors, indices)
  const positionBytes = vertexCount * 3 * 4; // 3 floats per vertex
  const normalBytes = vertexCount * 3 * 4;   // 3 floats per normal
  const colorBytes = vertexCount * 3 * 4;    // 3 floats per color
  const indexBytes = segments * segments * 6 * 2; // 6 indices per quad, 2 bytes per index
  
  const estimatedMemoryUsage = positionBytes + normalBytes + colorBytes + indexBytes;
  
  return {
    terrainWidth: width,
    terrainLength: length,
    terrainPosition: position,
    segmentCount: segments,
    vertexCount,
    estimatedMemoryUsage
  };
};

/**
 * Test if terrain width is optimized for viewport (focus on X-axis optimization)
 */
export const validateTerrainOptimization = (
  terrainMetrics: TerrainMetrics,
  viewportBounds: ViewportBounds
): {
  isOptimal: boolean;
  coverage: number;
  horizontalEfficiency: number;
  verticalWaste: number;
  recommendations: string[];
} => {
  const [terrainX, terrainY] = terrainMetrics.terrainPosition;
  const halfWidth = terrainMetrics.terrainWidth / 2;
  const halfLength = terrainMetrics.terrainLength / 2;
  
  // Calculate terrain bounds
  const terrainLeft = terrainX - halfWidth;
  const terrainRight = terrainX + halfWidth;
  const terrainTop = terrainY + halfLength;
  const terrainBottom = terrainY - halfLength;
  
  // Calculate intersection with viewport
  const intersectionLeft = Math.max(terrainLeft, viewportBounds.left);
  const intersectionRight = Math.min(terrainRight, viewportBounds.right);
  const intersectionTop = Math.min(terrainTop, viewportBounds.top);
  const intersectionBottom = Math.max(terrainBottom, viewportBounds.bottom);
  
  const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
  const intersectionHeight = Math.max(0, intersectionTop - intersectionBottom);
  const intersectionArea = intersectionWidth * intersectionHeight;
  
  const viewportArea = viewportBounds.visibleWidth * viewportBounds.visibleHeight;
  const coverage = intersectionArea / viewportArea;
  
  // Focus on horizontal efficiency (the actual optimization target)
  const horizontalEfficiency = intersectionWidth / terrainMetrics.terrainWidth;
  
  // Measure vertical waste (expected to be high due to design choice)
  const verticalIntersection = intersectionHeight;
  const verticalWaste = (terrainMetrics.terrainLength - verticalIntersection) / terrainMetrics.terrainLength;
  
  const recommendations: string[] = [];
  
  // Analysis focused on horizontal optimization
  if (coverage < 0.8) {
    recommendations.push(`Low viewport coverage (${(coverage * 100).toFixed(1)}%). Consider increasing terrain size.`);
  }
  
  if (horizontalEfficiency < 0.8) {
    recommendations.push(`Poor horizontal efficiency (${(horizontalEfficiency * 100).toFixed(1)}%). Terrain width not well-utilized.`);
  }
  
  // Check for significant horizontal overflow (the main optimization target)
  const leftOverflow = Math.max(0, viewportBounds.left - terrainLeft);
  const rightOverflow = Math.max(0, terrainRight - viewportBounds.right);
  
  if (leftOverflow > 10) {
    recommendations.push(`Terrain extends ${leftOverflow.toFixed(1)} units beyond left viewport edge.`);
  }
  
  if (rightOverflow > 10) {
    recommendations.push(`Terrain extends ${rightOverflow.toFixed(1)} units beyond right viewport edge.`);
  }
  
  // Optimization criteria: good coverage AND efficient horizontal usage
  const isOptimal = coverage >= 0.8 && horizontalEfficiency >= 0.8 && leftOverflow <= 10 && rightOverflow <= 10;
  
  return {
    isOptimal,
    coverage,
    horizontalEfficiency,
    verticalWaste,
    recommendations
  };
};

/**
 * Generate a comprehensive optimization report
 */
export const generateOptimizationReport = (
  currentConfig: { width: number; length: number; segments: number; position: [number, number, number] },
  originalConfig: { width: number; length: number; segments: number; position: [number, number, number] }
) => {
  const viewportBounds = calculateViewportBounds();
  
  const currentMetrics = calculateTerrainMetrics(
    currentConfig.width,
    currentConfig.length,
    currentConfig.segments,
    currentConfig.position
  );
  
  const originalMetrics = calculateTerrainMetrics(
    originalConfig.width,
    originalConfig.length,
    originalConfig.segments,
    originalConfig.position
  );
  
  const currentValidation = validateTerrainOptimization(currentMetrics, viewportBounds);
  const originalValidation = validateTerrainOptimization(originalMetrics, viewportBounds);
  
  const memorySavings = originalMetrics.estimatedMemoryUsage - currentMetrics.estimatedMemoryUsage;
  const memorySavingsPercent = (memorySavings / originalMetrics.estimatedMemoryUsage) * 100;
  
  const vertexReduction = originalMetrics.vertexCount - currentMetrics.vertexCount;
  const vertexReductionPercent = (vertexReduction / originalMetrics.vertexCount) * 100;
  
  return {
    viewport: viewportBounds,
    current: {
      metrics: currentMetrics,
      validation: currentValidation
    },
    original: {
      metrics: originalMetrics,
      validation: originalValidation
    },
    improvements: {
      memorySavings,
      memorySavingsPercent,
      vertexReduction,
      vertexReductionPercent,
      horizontalEfficiencyImprovement: (currentValidation.horizontalEfficiency - originalValidation.horizontalEfficiency) * 100
    }
  };
};

/**
 * Performance benchmark helper - measures terrain generation time
 */
export const benchmarkTerrainGeneration = async (
  width: number,
  length: number,
  segments: number,
  iterations: number = 10
): Promise<{
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
}> => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Simulate terrain generation
    const geometry = new THREE.PlaneGeometry(width, length, segments, segments);
    const positions = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Simulate the Brownian noise calculation
    for (let j = 0; j < positions.count; j++) {
      vertex.fromBufferAttribute(positions, j);
      
      let height = 0;
      let amplitude = 1;
      let frequency = 0.005;
      const octaves = 6;
      const persistence = 0.6;
      const lacunarity = 2;
      
      for (let octave = 0; octave < octaves; octave++) {
        const sampleX = vertex.x * frequency;
        const sampleY = vertex.y * frequency;
        
        const noiseValue = Math.sin(sampleX) * Math.cos(sampleY) + 
                          Math.sin(sampleX * 2.1) * Math.cos(sampleY * 2.3) * 0.5 +
                          Math.sin(sampleX * 4.7) * Math.cos(sampleY * 4.1) * 0.25;
        
        height += amplitude * noiseValue;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      positions.setZ(j, height * 30);
    }
    
    geometry.computeVertexNormals();
    
    const end = performance.now();
    times.push(end - start);
    
    // Cleanup
    geometry.dispose();
  }
  
  const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  const variance = times.reduce((acc, time) => acc + Math.pow(time - averageTime, 2), 0) / times.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    averageTime,
    minTime,
    maxTime,
    standardDeviation
  };
};