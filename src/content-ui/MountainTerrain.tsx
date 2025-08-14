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
    const baseColor = new THREE.Color(0x8B7355); // Muted brown
    const peakColor = new THREE.Color(0x757573); // Peak gray
    
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
    
    // Second pass: assign colors based on normalized height
    for (let i = 0; i < positions.count; i++) {
      const normalizedHeight = (heights[i] - minHeight) / (maxHeightValue - minHeight);
      
      // Use a threshold approach: only peaks (top 20%) get the gray color
      const peakThreshold = 0.8;
      let colorMix;
      
      if (normalizedHeight > peakThreshold) {
        // Interpolate between brown and gray for peak areas
        colorMix = (normalizedHeight - peakThreshold) / (1 - peakThreshold);
      } else {
        // Keep as brown for lower areas
        colorMix = 0;
      }
      
      const color = baseColor.clone().lerp(peakColor, colorMix);
      
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
      flatShading: true, // Low poly look
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