import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface MountainTerrainProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  length?: number;
  maxHeight?: number;
  segments?: number;
}

const MountainTerrain = ({
  position = [0, -15, -30],
  rotation = [-Math.PI / 2, 0, 0],
  width = 450,
  length = 300, // width:length ratio of 1.5
  maxHeight = 300,
  segments = 92
}: MountainTerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, material } = useMemo(() => {
    // Create plane geometry with specified segments
    const geo = new THREE.PlaneGeometry(width, length, segments, segments);
    
    // Create Brownian noise heightmap manually
    const positions = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
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
        
        // Simple noise function (you can replace with proper Perlin noise)
        const noiseValue = Math.sin(sampleX) * Math.cos(sampleY) + 
                          Math.sin(sampleX * 2.1) * Math.cos(sampleY * 2.3) * 0.5 +
                          Math.sin(sampleX * 4.7) * Math.cos(sampleY * 4.1) * 0.25;
        
        height += amplitude * noiseValue;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      // Linear easing (no transformation)
      const finalHeight = height * maxHeight * 0.1;
      
      // Set the Z position (height)
      positions.setZ(i, finalHeight);
    }
    
    positions.needsUpdate = true;
    geo.computeVertexNormals();

    // Create blended material for mountain look
    const mat = new THREE.MeshLambertMaterial({
      color: 0x8B7355, // Brown mountain color
      flatShading: true, // Low poly look
      side: THREE.DoubleSide,
    });

    return { geometry: geo, material: mat };
  }, [width, length, maxHeight, segments]);

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