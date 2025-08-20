/**
 * Web Worker for terrain geometry generation
 * Offloads heavy computation from main thread to prevent blocking
 */

import { TerrainWorkerInput, TerrainWorkerMessage, TerrainWorkerResponse, TerrainWorkerResult } from './terrainWorker.types';

// Color definitions (same as original component)
interface Color {
  r: number;
  g: number;
  b: number;
}

const createColor = (hex: number): Color => ({
  r: ((hex >> 16) & 255) / 255,
  g: ((hex >> 8) & 255) / 255,
  b: (hex & 255) / 255
});

const lerpColor = (color1: Color, color2: Color, amount: number): Color => ({
  r: color1.r + (color2.r - color1.r) * amount,
  g: color1.g + (color2.g - color1.g) * amount,
  b: color1.b + (color2.b - color1.b) * amount
});

const cloneColor = (color: Color): Color => ({ ...color });

// Define colors (same as original component)
const baseColor = createColor(0x757573); // Gray (formerly brown areas)
const patchColor = createColor(0x616159); // Darker gray patches on mountain sides
const patchColor2 = createColor(0x6e6e68); // Medium gray patches on mountain sides
const peakColor = createColor(0x34752a); // Green peaks
const peakColor2 = createColor(0x317a26); // Darker green for peak variation
const peakColor3 = createColor(0x2d961d); // Bright green for peak variation

/**
 * Generate terrain geometry data
 */
function generateTerrain(input: TerrainWorkerInput): TerrainWorkerResult {
  const { width, length, maxHeight, segments, seed } = input;
  
  // Calculate vertex count for plane geometry (segments x segments grid)
  const vertexCount = (segments + 1) * (segments + 1);
  
  // Create positions array (x, y, z for each vertex)
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  
  // Track min and max heights for normalization
  let minHeight = Infinity;
  let maxHeightValue = -Infinity;
  const heights: number[] = [];
  
  // Generate vertices in a grid pattern
  const halfWidth = width / 2;
  const halfLength = length / 2;
  
  // First pass: calculate positions and heights
  for (let y = 0; y <= segments; y++) {
    for (let x = 0; x <= segments; x++) {
      const vertexIndex = y * (segments + 1) + x;
      
      // Calculate world position
      const worldX = (x / segments) * width - halfWidth;
      const worldY = (y / segments) * length - halfLength;
      
      // Brownian motion parameters (same as original)
      let height = 0;
      let amplitude = 1;
      let frequency = 0.005;
      const octaves = 6;
      const persistence = 0.6;
      const lacunarity = 2;
      
      // Generate Brownian noise (same algorithm as original)
      for (let octave = 0; octave < octaves; octave++) {
        const sampleX = worldX * frequency;
        const sampleY = worldY * frequency;
        
        // Simple noise function with seed offset (same as original)
        const noiseValue = Math.sin(sampleX + seed) * Math.cos(sampleY + seed) + 
                          Math.sin(sampleX * 2.1 + seed * 1.3) * Math.cos(sampleY * 2.3 + seed * 2.7) * 0.5 +
                          Math.sin(sampleX * 4.7 + seed * 3.1) * Math.cos(sampleY * 4.1 + seed * 4.9) * 0.25;
        
        height += amplitude * noiseValue;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      // Linear easing (no transformation)
      const finalHeight = height * maxHeight * 0.1;
      heights[vertexIndex] = finalHeight;
      
      minHeight = Math.min(minHeight, finalHeight);
      maxHeightValue = Math.max(maxHeightValue, finalHeight);
      
      // Set position (x, y, z)
      const positionIndex = vertexIndex * 3;
      positions[positionIndex] = worldX;     // x
      positions[positionIndex + 1] = worldY; // y
      positions[positionIndex + 2] = finalHeight; // z (height)
    }
  }
  
  // Helper function to get vertex index from grid coordinates
  const getVertexIndex = (x: number, y: number) => {
    if (x < 0 || x > segments || y < 0 || y > segments) return -1;
    return y * (segments + 1) + x;
  };
  
  // Helper function to check if a vertex is a peak or near-peak
  const isPeakOrNearPeak = (vertexIndex: number, x: number, y: number) => {
    const currentHeight = heights[vertexIndex];
    
    // Check all 8 neighbors
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    let higherNeighbors = 0;
    let validNeighbors = 0;
    
    for (const [dx, dy] of neighbors) {
      const neighborX = x + dx;
      const neighborY = y + dy;
      const neighborIndex = getVertexIndex(neighborX, neighborY);
      
      if (neighborIndex >= 0 && neighborIndex < heights.length) {
        validNeighbors++;
        if (heights[neighborIndex] >= currentHeight) {
          higherNeighbors++;
        }
      }
    }
    
    // Slightly looser criteria: consider it a peak area if it's higher than at least 60% of neighbors
    return validNeighbors > 0 && (higherNeighbors / validNeighbors) <= 0.4;
  };

  // Helper function to check if a vertex is on mountain side (elevated but not peak)
  const isMountainSide = (vertexIndex: number, x: number, y: number) => {
    const currentHeight = heights[vertexIndex];
    const normalizedHeight = (currentHeight - minHeight) / (maxHeightValue - minHeight);
    
    // Only consider vertices in upper 30-80% height range (mountain sides)
    if (normalizedHeight < 0.3 || normalizedHeight > 0.8) return false;
    
    // Find nearby peaks within a radius
    const searchRadius = 3;
    let nearPeak = false;
    
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const neighborX = x + dx;
        const neighborY = y + dy;
        const neighborIndex = getVertexIndex(neighborX, neighborY);
        
        if (neighborIndex >= 0 && neighborIndex < heights.length) {
          if (isPeakOrNearPeak(neighborIndex, neighborX, neighborY)) {
            nearPeak = true;
            break;
          }
        }
      }
      if (nearPeak) break;
    }
    
    // Create patch pattern using noise for organic shapes
    if (nearPeak) {
      const patchNoise = Math.sin(x * 0.3 + seed) * Math.cos(y * 0.3 + seed * 1.7) + 
                        Math.sin(x * 0.8 + seed * 2.1) * Math.cos(y * 0.6 + seed * 3.3) * 0.5;
      return patchNoise > 0.2; // Threshold for patch visibility
    }
    
    return false;
  };

  // Helper function for second mountain side patch type
  const isMountainSide2 = (vertexIndex: number, x: number, y: number) => {
    const currentHeight = heights[vertexIndex];
    const normalizedHeight = (currentHeight - minHeight) / (maxHeightValue - minHeight);
    
    // Consider vertices in middle 25-70% height range (slightly different from first patches)
    if (normalizedHeight < 0.25 || normalizedHeight > 0.7) return false;
    
    // Find nearby peaks within a radius
    const searchRadius = 4;
    let nearPeak = false;
    
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const neighborX = x + dx;
        const neighborY = y + dy;
        const neighborIndex = getVertexIndex(neighborX, neighborY);
        
        if (neighborIndex >= 0 && neighborIndex < heights.length) {
          if (isPeakOrNearPeak(neighborIndex, neighborX, neighborY)) {
            nearPeak = true;
            break;
          }
        }
      }
      if (nearPeak) break;
    }
    
    // Create different patch pattern using different noise frequencies
    if (nearPeak) {
      const patchNoise = Math.sin(x * 0.5 + seed * 1.9) * Math.cos(y * 0.4 + seed * 2.3) + 
                        Math.sin(x * 1.2 + seed * 3.7) * Math.cos(y * 0.9 + seed * 4.1) * 0.6;
      return patchNoise > 0.3; // Different threshold for varied patch sizes
    }
    
    return false;
  };
  
  // Second pass: assign colors based on terrain analysis
  for (let y = 0; y <= segments; y++) {
    for (let x = 0; x <= segments; x++) {
      const vertexIndex = y * (segments + 1) + x;
      
      // Check vertex type
      const isVertexPeak = isPeakOrNearPeak(vertexIndex, x, y);
      const isVertexMountainSide = !isVertexPeak && isMountainSide(vertexIndex, x, y);
      const isVertexMountainSide2 = !isVertexPeak && !isVertexMountainSide && isMountainSide2(vertexIndex, x, y);
      
      // Determine color based on vertex type
      let color: Color;
      if (isVertexPeak) {
        // Add variation to green peaks using multiple noise layers
        const greenVariation1 = Math.sin(x * 0.7 + seed * 2.5) * Math.cos(y * 0.6 + seed * 3.1) + 
                               Math.sin(x * 1.4 + seed * 4.7) * Math.cos(y * 1.1 + seed * 5.3) * 0.6;
        const greenVariation2 = Math.sin(x * 0.9 + seed * 6.2) * Math.cos(y * 0.8 + seed * 7.4) + 
                               Math.sin(x * 1.8 + seed * 8.1) * Math.cos(y * 1.5 + seed * 9.7) * 0.4;
        
        // Determine which colors to blend based on noise values
        const noise1 = (greenVariation1 + 1) * 0.5; // Normalize to 0-1
        const noise2 = (greenVariation2 + 1) * 0.5; // Normalize to 0-1
        
        // Create three-way color blending
        if (noise1 < 0.33) {
          // Blend between peakColor and peakColor2
          const mixAmount = noise2 * 0.6;
          color = lerpColor(cloneColor(peakColor), peakColor2, mixAmount);
        } else if (noise1 < 0.66) {
          // Blend between peakColor and peakColor3
          const mixAmount = noise2 * 0.5;
          color = lerpColor(cloneColor(peakColor), peakColor3, mixAmount);
        } else {
          // Blend between peakColor2 and peakColor3
          const mixAmount = noise2 * 0.7;
          color = lerpColor(cloneColor(peakColor2), peakColor3, mixAmount);
        }
      } else if (isVertexMountainSide) {
        color = patchColor; // Darker gray patches on mountain sides
      } else if (isVertexMountainSide2) {
        color = patchColor2; // Medium gray patches on mountain sides
      } else {
        color = baseColor; // Base gray
      }
      
      // Set color values
      const colorIndex = vertexIndex * 3;
      colors[colorIndex] = color.r;
      colors[colorIndex + 1] = color.g;
      colors[colorIndex + 2] = color.b;
    }
  }
  
  return {
    positions,
    colors,
    vertexCount
  };
}

// Worker message handler
self.onmessage = (event: MessageEvent<TerrainWorkerMessage>) => {
  const { type, payload, id } = event.data;
  
  try {
    if (type === 'GENERATE_TERRAIN') {
      const result = generateTerrain(payload);
      
      const response: TerrainWorkerResponse = {
        type: 'TERRAIN_GENERATED',
        payload: result,
        id
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const errorResponse: TerrainWorkerResponse = {
      type: 'TERRAIN_ERROR',
      payload: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      id
    };
    
    self.postMessage(errorResponse);
  }
};