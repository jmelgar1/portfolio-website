import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface MountainTerrainProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  length?: number;
  maxHeight?: number;
  segments?: number;
  seed?: number;
}

const MountainTerrain = ({
  position = [0, -15, -30],
  rotation = [-Math.PI / 2, 0, 0],
  width = 450,
  length = 300, // width:length ratio of 1.5
  maxHeight = 300,
  segments = 92,
  seed = Math.random()
}: MountainTerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, material } = useMemo(() => {
    // Create plane geometry with specified segments
    const geo = new THREE.PlaneGeometry(width, length, segments, segments);
    
    // Create Brownian noise heightmap manually
    const positions = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Create color array for vertex colors
    const colors = new Float32Array(positions.count * 3);
    const baseColor = new THREE.Color(0x757573); // Gray (formerly brown areas)
    const patchColor = new THREE.Color(0x616159); // Darker gray patches on mountain sides
    const patchColor2 = new THREE.Color(0x6e6e68); // Medium gray patches on mountain sides
    const peakColor = new THREE.Color(0x34752a); // Green peaks
    const peakColor2 = new THREE.Color(0x317a26); // Darker green for peak variation
    const peakColor3 = new THREE.Color(0x2d961d); // Bright green for peak variation
    
    // Track min and max heights for normalization
    let minHeight = Infinity;
    let maxHeightValue = -Infinity;
    const heights: number[] = [];
    
    // First pass: calculate heights
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      // Brownian motion parameters
      let height = 0;
      let amplitude = 1;
      let frequency = 0.005; // Adjust for terrain scale
      const octaves = 6;
      const persistence = 0.6;
      const lacunarity = 2;
      
      // Generate Brownian noise
      for (let octave = 0; octave < octaves; octave++) {
        const sampleX = vertex.x * frequency;
        const sampleY = vertex.y * frequency;
        
        // Simple noise function with seed offset
        const noiseValue = Math.sin(sampleX + seed) * Math.cos(sampleY + seed) + 
                          Math.sin(sampleX * 2.1 + seed * 1.3) * Math.cos(sampleY * 2.3 + seed * 2.7) * 0.5 +
                          Math.sin(sampleX * 4.7 + seed * 3.1) * Math.cos(sampleY * 4.1 + seed * 4.9) * 0.25;
        
        height += amplitude * noiseValue;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      // Linear easing (no transformation)
      const finalHeight = height * maxHeight * 0.1;
      heights[i] = finalHeight;
      
      minHeight = Math.min(minHeight, finalHeight);
      maxHeightValue = Math.max(maxHeightValue, finalHeight);
      
      // Set the Z position (height)
      positions.setZ(i, finalHeight);
    }
    
    // Second pass: detect peaks and assign colors
    const segmentsX = segments;
    const segmentsY = segments;
    
    // Helper function to get vertex index from grid coordinates
    const getVertexIndex = (x: number, y: number) => {
      if (x < 0 || x > segmentsX || y < 0 || y > segmentsY) return -1;
      return y * (segmentsX + 1) + x;
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
    
    for (let i = 0; i < positions.count; i++) {
      // Convert linear index back to grid coordinates
      const x = i % (segmentsX + 1);
      const y = Math.floor(i / (segmentsX + 1));
      
      // Check vertex type
      const isVertexPeak = isPeakOrNearPeak(i, x, y);
      const isVertexMountainSide = !isVertexPeak && isMountainSide(i, x, y);
      const isVertexMountainSide2 = !isVertexPeak && !isVertexMountainSide && isMountainSide2(i, x, y);
      
      // Determine color based on vertex type
      let color;
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
          color = peakColor.clone().lerp(peakColor2, mixAmount);
        } else if (noise1 < 0.66) {
          // Blend between peakColor and peakColor3
          const mixAmount = noise2 * 0.5;
          color = peakColor.clone().lerp(peakColor3, mixAmount);
        } else {
          // Blend between peakColor2 and peakColor3
          const mixAmount = noise2 * 0.7;
          color = peakColor2.clone().lerp(peakColor3, mixAmount);
        }
      } else if (isVertexMountainSide) {
        color = patchColor; // Darker gray patches on mountain sides
      } else if (isVertexMountainSide2) {
        color = patchColor2; // Medium gray patches on mountain sides
      } else {
        color = baseColor; // Base gray
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    // Add color attribute to geometry
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    positions.needsUpdate = true;
    geo.computeVertexNormals();

    // Create blended material for mountain look
    const mat = new THREE.MeshLambertMaterial({
      vertexColors: true, // Enable vertex colors
      flatShading: false, // Smooth shading
      side: THREE.DoubleSide,
    });

    return { geometry: geo, material: mat };
  }, [width, length, maxHeight, segments, seed]);

  // No rotation animation

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  );
};

export default MountainTerrain;