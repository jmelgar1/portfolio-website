import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Individual Cloud Component
interface CloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}

const Cloud: React.FC<CloudProps> = ({ position, scale = 1, speed = 0.5 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create cloud geometry by merging multiple spheres with vertex jittering
  const cloudGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    // Create multiple sphere geometries to merge
    const sphereConfigs = [
      { radius: 3 * scale, position: [-2 * scale, 0, 0], segments: 8 },
      { radius: 4 * scale, position: [0, 0, 0], segments: 8 },
      { radius: 3.5 * scale, position: [2.5 * scale, 0.5 * scale, 0], segments: 8 },
      { radius: 2.5 * scale, position: [-1 * scale, 2 * scale, 0], segments: 6 },
      { radius: 2 * scale, position: [1.5 * scale, -1.5 * scale, 0], segments: 6 },
    ];
    
    let vertexOffset = 0;
    
    sphereConfigs.forEach(config => {
      const sphereGeometry = new THREE.SphereGeometry(config.radius, config.segments, config.segments);
      const spherePositions = sphereGeometry.attributes.position.array as Float32Array;
      const sphereNormals = sphereGeometry.attributes.normal.array as Float32Array;
      const sphereIndices = sphereGeometry.index?.array as Uint16Array;
      
      // Add jitter to vertices for more organic look
      const jitteredPositions = new Float32Array(spherePositions.length);
      for (let i = 0; i < spherePositions.length; i += 3) {
        const jitterAmount = 0.3 * scale;
        jitteredPositions[i] = spherePositions[i] + config.position[0] + (Math.random() - 0.5) * jitterAmount;
        jitteredPositions[i + 1] = spherePositions[i + 1] + config.position[1] + (Math.random() - 0.5) * jitterAmount;
        jitteredPositions[i + 2] = spherePositions[i + 2] + config.position[2] + (Math.random() - 0.5) * jitterAmount;
        
        // Flatten bottom slightly for more realistic cloud shape
        if (jitteredPositions[i + 1] < -config.radius * 0.3) {
          jitteredPositions[i + 1] *= 0.7;
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
  }, [scale]);
  
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
        color="#f0f8ff"
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
  );
};

const Clouds: React.FC = () => {
  // Create multiple clouds with varied properties
  const cloudInstances = useMemo(() => [
    { position: [-80, 0, 0] as [number, number, number], scale: 1.2, speed: 0.3 },
    { position: [-60, 5, -10] as [number, number, number], scale: 0.8, speed: 0.5 },
    { position: [-40, -3, 5] as [number, number, number], scale: 1.0, speed: 0.4 },
    { position: [-20, 8, -5] as [number, number, number], scale: 1.5, speed: 0.2 },
    { position: [0, 2, 8] as [number, number, number], scale: 0.9, speed: 0.6 },
    { position: [20, -5, -8] as [number, number, number], scale: 1.1, speed: 0.35 },
    { position: [40, 6, 3] as [number, number, number], scale: 0.7, speed: 0.7 },
    { position: [60, -2, -12] as [number, number, number], scale: 1.3, speed: 0.25 },
    { position: [80, 4, 6] as [number, number, number], scale: 1.0, speed: 0.45 },
  ], []);
  
  return (
    <group position={[0, -20, -200]}>
      {cloudInstances.map((cloud, index) => (
        <Cloud
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
        />
      ))}
    </group>
  );
};

export default Clouds;