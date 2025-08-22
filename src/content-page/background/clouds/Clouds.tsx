import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Individual Cloud Component
interface CloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  seed?: number;
  cloudType?: 'puffy' | 'wispy' | 'dense' | 'elongated';
}

const Cloud: React.FC<CloudProps> = ({ position, scale = 1, speed = 0.5, seed = 0, cloudType = 'puffy' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Seeded random function
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  // Create cloud geometry using deformed sphere approach with type-specific variations
  const cloudGeometry = useMemo(() => {
    const random = seededRandom(seed);
    
    // Get cloud type parameters for blob-like shapes
    const getCloudTypeParams = (type: string) => {
      switch (type) {
        case 'puffy':
          return {
            segments: Math.floor(random() * 4) + 14,
            noiseScale1: 0.4 + random() * 0.5,
            noiseScale2: 0.2 + random() * 0.3,
            noiseScale3: 0.05 + random() * 0.1,
            flattenAmount: 0.85 + random() * 0.1, // Reduced flattening: 0.85-0.95
            asymmetryX: 0.8 + random() * 0.4, // 0.8-1.2 asymmetric blob
            asymmetryY: 0.9 + random() * 0.2, // 0.9-1.1 slight variation
            asymmetryZ: 0.8 + random() * 0.4, // 0.8-1.2 asymmetric blob
            bulgeFreq: Math.floor(random() * 3) + 2, // 2-4 bulges around cloud
          };
        case 'wispy':
          return {
            segments: Math.floor(random() * 3) + 10,
            noiseScale1: 0.6 + random() * 0.8,
            noiseScale2: 0.3 + random() * 0.4,
            noiseScale3: 0.1 + random() * 0.2,
            flattenAmount: 0.7 + random() * 0.2, // Less extreme: 0.7-0.9
            asymmetryX: 1.5 + random() * 0.8, // 1.5-2.3 stretched blob
            asymmetryY: 0.4 + random() * 0.3, // 0.4-0.7 thinner
            asymmetryZ: 0.7 + random() * 0.4, // 0.7-1.1 varied depth
            bulgeFreq: Math.floor(random() * 2) + 1, // 1-2 main wisps
          };
        case 'dense':
          return {
            segments: Math.floor(random() * 3) + 16,
            noiseScale1: 0.2 + random() * 0.3,
            noiseScale2: 0.1 + random() * 0.15,
            noiseScale3: 0.02 + random() * 0.05,
            flattenAmount: 0.9 + random() * 0.08, // Minimal: 0.9-0.98
            asymmetryX: 0.85 + random() * 0.3, // 0.85-1.15 compact blob
            asymmetryY: 1.0 + random() * 0.3, // 1.0-1.3 slightly taller
            asymmetryZ: 0.85 + random() * 0.3, // 0.85-1.15 compact blob
            bulgeFreq: Math.floor(random() * 4) + 3, // 3-6 dense bumps
          };
        case 'elongated':
          return {
            segments: Math.floor(random() * 4) + 12,
            noiseScale1: 0.3 + random() * 0.4,
            noiseScale2: 0.15 + random() * 0.25,
            noiseScale3: 0.05 + random() * 0.1,
            flattenAmount: 0.8 + random() * 0.15, // Moderate: 0.8-0.95
            asymmetryX: 2.0 + random() * 1.0, // 2.0-3.0 very stretched
            asymmetryY: 0.6 + random() * 0.3, // 0.6-0.9 lower profile
            asymmetryZ: 0.8 + random() * 0.3, // 0.8-1.1 varied depth
            bulgeFreq: Math.floor(random() * 3) + 2, // 2-4 elongated segments
          };
        default:
          return getCloudTypeParams('puffy');
      }
    };
    
    const params = getCloudTypeParams(cloudType);
    const geometry = new THREE.SphereGeometry(2 * scale, params.segments, params.segments);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Apply deformation to create varied blob-like cloud shapes
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const distance = vertex.length();
      
      // Calculate spherical coordinates for organic bulge patterns
      const theta = Math.atan2(vertex.z, vertex.x); // Horizontal angle
      const phi = Math.acos(vertex.y / distance); // Vertical angle
      
      // Create bulge patterns based on cloud type
      const bulgePattern = Math.sin(theta * params.bulgeFreq) * Math.sin(phi * params.bulgeFreq * 0.7);
      const bulgeFactor = 1.0 + (bulgePattern * 0.3 + random() * 0.2) * (random() > 0.3 ? 1 : -0.5);
      
      // Multiple layers of displacement for organic shape
      const displacement1 = (random() - 0.5) * params.noiseScale1 * scale * bulgeFactor;
      const displacement2 = (random() - 0.5) * params.noiseScale2 * scale;
      const displacement3 = (random() - 0.5) * params.noiseScale3 * scale;
      
      // Combine displacements with different weights
      const totalDisplacement = displacement1 + displacement2 * 0.7 + displacement3 * 0.3;
      
      // Apply displacement along the normal direction
      vertex.normalize().multiplyScalar(distance + totalDisplacement);
      
      // Apply gentle bottom flattening (much less aggressive)
      if (vertex.y < 0) {
        vertex.y *= params.flattenAmount;
      }
      
      // Apply asymmetric blob-like scaling for varied shapes
      vertex.x *= params.asymmetryX;
      vertex.z *= params.asymmetryZ;
      vertex.y *= params.asymmetryY;
      
      // Add subtle asymmetric warping for more organic blob shapes
      const warpX = Math.sin(phi * 2) * 0.1 * scale * (random() - 0.5);
      const warpZ = Math.cos(theta * 1.5) * 0.1 * scale * (random() - 0.5);
      vertex.x += warpX;
      vertex.z += warpZ;
      
      positions[i] = vertex.x;
      positions[i + 1] = vertex.y;
      positions[i + 2] = vertex.z;
    }
    
    // Recompute normals for proper lighting
    geometry.computeVertexNormals();
    
    return geometry;
  }, [scale, seed, cloudType]);
  
  // Generate random cloud color variation using seed
  const cloudColor = useMemo(() => {
    const random = seededRandom(seed + 1000); // Different seed for color
    const baseHue = 200; // Blue base
    const hueVariation = (random() - 0.5) * 20; // ±10 hue variation
    const saturation = 20 + random() * 15; // 20-35% saturation
    const lightness = 85 + random() * 10; // 85-95% lightness
    
    return `hsl(${baseHue + hueVariation}, ${saturation}%, ${lightness}%)`;
  }, [seed]);
  
  
  // Animation loop for left-to-right movement
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += speed * delta * 10;
      
      // Reset position when cloud moves too far right (accounting for cloud width)
      if (meshRef.current.position.x > 150) {
        meshRef.current.position.x = -150;
      }
      
      // Add subtle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0] * 0.1) * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} geometry={cloudGeometry}>
      <meshStandardMaterial
        color={cloudColor}
        transparent
        opacity={0.9}
        side={THREE.FrontSide}
        roughness={1.0}
        metalness={0.0}
        depthWrite={false}
        depthTest={true}
        alphaTest={0.1}
      />
    </mesh>
  );
};

const Clouds: React.FC = () => {
  // Generate clouds using algorithm instead of hardcoded values
  const cloudInstances = useMemo(() => {
    const clouds = [];
    const numClouds = 44; // Same number as before
    const seededRandom = (seed: number) => {
      let value = seed;
      return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      };
    };
    
    const masterRandom = seededRandom(12345); // Master seed for consistent generation
    
    for (let i = 0; i < numClouds; i++) {
      // Generate deterministic but varied positions
      const xRange = 480; // Total range from -240 to 240
      const x = -240 + (i / (numClouds - 1)) * xRange + (masterRandom() - 0.5) * 80; // Distributed with some randomness
      const y = -25 + masterRandom() * 65; // Range from -25 to 40
      const z = -25 + masterRandom() * 50; // Range from -25 to 25
      
      // Generate varied scales (4.16 to 9.0 range - increased minimum by 30%)
      const scale = 4.16 + masterRandom() * 4.84;
      
      // Generate varied speeds (0.2 to 0.8 range from original)
      const speed = 0.2 + masterRandom() * 0.6;
      
      // Generate unique seed for each cloud
      const seed = Math.floor(masterRandom() * 100000) + 10000;
      
      clouds.push({
        position: [x, y, z] as [number, number, number],
        scale: Math.round(scale * 10) / 10, // Round to 1 decimal
        speed: Math.round(speed * 100) / 100, // Round to 2 decimals
        seed,
        cloudType: 'elongated' as const
      });
    }
    
    return clouds;
  }, []);
  
  return (
    <group position={[0, -20, -600]}>
      {cloudInstances.map((cloud, index) => (
        <Cloud
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          seed={cloud.seed}
          cloudType={cloud.cloudType}
        />
      ))}
    </group>
  );
};

export default Clouds;