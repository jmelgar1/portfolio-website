import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Individual Cloud Component
interface CloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  seed?: number;
}

const Cloud: React.FC<CloudProps> = ({ position, scale = 1, speed = 0.5, seed = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Seeded random function
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  // Create cloud geometry by merging multiple spheres with vertex jittering
  const cloudGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    // Use the seeded random generator
    const random = seededRandom(seed);
    
    // Generate random sphere configurations for variety
    const numSpheres = Math.floor(random() * 3) + 4; // 4-6 spheres
    const sphereConfigs = [];
    
    for (let i = 0; i < numSpheres; i++) {
      const radius = (1.5 + random() * 2.5) * scale; // Random radius 1.5-4.0
      const x = (random() - 0.5) * 8 * scale; // Reduced X spread for more overlap
      const y = (random() - 0.5) * 3 * scale; // Reduced Y spread for more overlap
      const z = (random() - 0.5) * 1.5 * scale; // Reduced Z spread for more overlap
      const segments = Math.floor(random() * 2) + 6; // 6-7 segments (lower poly for better merging)
      
      sphereConfigs.push({
        radius,
        position: [x, y, z],
        segments
      });
    }
    
    let vertexOffset = 0;
    
    sphereConfigs.forEach(config => {
      const sphereGeometry = new THREE.SphereGeometry(config.radius, config.segments, config.segments);
      const spherePositions = sphereGeometry.attributes.position.array as Float32Array;
      const sphereNormals = sphereGeometry.attributes.normal.array as Float32Array;
      const sphereIndices = sphereGeometry.index?.array as Uint16Array;
      
      // Add jitter to vertices for more organic look using seeded random
      const jitteredPositions = new Float32Array(spherePositions.length);
      for (let i = 0; i < spherePositions.length; i += 3) {
        const jitterAmount = (0.2 + random() * 0.3) * scale; // Variable jitter 0.2-0.5
        jitteredPositions[i] = spherePositions[i] + config.position[0] + (random() - 0.5) * jitterAmount;
        jitteredPositions[i + 1] = spherePositions[i + 1] + config.position[1] + (random() - 0.5) * jitterAmount;
        jitteredPositions[i + 2] = spherePositions[i + 2] + config.position[2] + (random() - 0.5) * jitterAmount;
        
        // Flatten bottom slightly for more realistic cloud shape (variable flattening)
        const flattenThreshold = config.radius * (0.2 + random() * 0.2); // Variable threshold
        if (jitteredPositions[i + 1] < -flattenThreshold) {
          jitteredPositions[i + 1] *= (0.5 + random() * 0.3); // Variable flattening 0.5-0.8
        }
      }
      
      // Add to main arrays
      for (let i = 0; i < jitteredPositions.length; i++) {
        positions.push(jitteredPositions[i]);
      }
      for (let i = 0; i < sphereNormals.length; i++) {
        normals.push(sphereNormals[i]);
      }
      
      // Adjust indices for vertex offset
      if (sphereIndices) {
        for (let i = 0; i < sphereIndices.length; i++) {
          indices.push(sphereIndices[i] + vertexOffset);
        }
      }
      
      vertexOffset += spherePositions.length / 3;
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [scale, seed]);
  
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
      
      // Reset position when cloud moves too far right
      if (meshRef.current.position.x > 100) {
        meshRef.current.position.x = -100;
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
  // Create multiple clouds with varied properties and unique seeds (minimum scale 3.0)
  const cloudInstances = useMemo(() => [
    { position: [-120, 0, 0] as [number, number, number], scale: 4.0, speed: 0.3, seed: 12345 },
    { position: [-80, 8, -10] as [number, number, number], scale: 3.2, speed: 0.5, seed: 67890 },
    { position: [-30, -5, 5] as [number, number, number], scale: 3.8, speed: 0.4, seed: 24680 },
    { position: [20, 12, -5] as [number, number, number], scale: 4.5, speed: 0.2, seed: 13579 },
    { position: [70, 3, 8] as [number, number, number], scale: 3.6, speed: 0.6, seed: 97531 },
    { position: [120, -8, -8] as [number, number, number], scale: 4.2, speed: 0.35, seed: 86420 },
    { position: [170, 10, 3] as [number, number, number], scale: 3.0, speed: 0.7, seed: 75319 },
  ], []);
  
  return (
    <group position={[0, -20, -600]}>
      {cloudInstances.map((cloud, index) => (
        <Cloud
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          seed={cloud.seed}
        />
      ))}
    </group>
  );
};

export default Clouds;