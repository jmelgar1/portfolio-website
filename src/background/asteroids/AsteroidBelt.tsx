import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CubeData {
  id: number;
  startX: number;
  startY: number;
  currentY: number;
  size: number;
  xOffset: number;
  rotationSpeed: { x: number; y: number; z: number };
  moveSpeed: number;
}

const AsteroidBelt: React.FC = () => {
  const cubeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cubeData = useRef<CubeData[]>([]);
  
  // Initialize cube data
  useMemo(() => {
    cubeData.current = [];
    const pathLength = 30; // Total path length from bottom to top
    
    // Generate 45 irregular positions along the path
    const positions: number[] = [];
    for (let i = 0; i < 45; i++) {
      // Create clusters and gaps for more realistic distribution
      const baseProgress = i / 44;
      const clusterVariation = (Math.random() - 0.5) * 0.03; // Small random variation
      positions.push(Math.max(0, Math.min(1, baseProgress + clusterVariation)));
    }
    positions.sort((a, b) => a - b); // Ensure they're ordered
    
    for (let i = 0; i < 45; i++) {
      const progress = positions[i]; // Irregular spacing
      cubeData.current.push({
        id: i,
        startX: (i - 6) * 0.8,
        startY: (i - 6) * 1.2,
        currentY: -pathLength/2 + (progress * pathLength) - 5,
        size: 0.2 + Math.random() * 0.6, // Random size between 0.2 and 0.8
        xOffset: (Math.random() - 0.5) * 2, // Random X offset between -1 and 1
        rotationSpeed: {
          x: (Math.random() - 0.5) * 2, // Random rotation speed between -1 and 1
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        },
        moveSpeed: 1.5 + Math.random() * 1.5, // Random move speed between 1.5 and 3.0
      });
    }
  }, []);

  useFrame((state, delta) => {
    const pathLength = 30;
    const pathStart = -pathLength/2;
    const pathEnd = pathLength/2;
    
    cubeRefs.current.forEach((cube, index) => {
      if (cube && cubeData.current[index]) {
        // Individual rotation speeds
        const rotSpeed = cubeData.current[index].rotationSpeed;
        cube.rotation.x += delta * rotSpeed.x;
        cube.rotation.y += delta * rotSpeed.y;
        cube.rotation.z += delta * rotSpeed.z;
        
        // Individual movement speeds
        const individualMoveSpeed = cubeData.current[index].moveSpeed;
        cubeData.current[index].currentY += individualMoveSpeed * delta;
        
        // Reset position when cube goes above viewport
        if (cubeData.current[index].currentY > pathEnd) {
          cubeData.current[index].currentY = pathStart;
        }
        
        // Calculate position along diagonal path
        const pathProgress = (cubeData.current[index].currentY - pathStart) / pathLength;
        const baseX = -3.8 + (pathProgress * 9.6); // Move from left (-2.8) to right (+6.8) - shifted right by 2 units
        const currentX = baseX + cubeData.current[index].xOffset; // Add random offset
        const currentY = cubeData.current[index].currentY;
        
        // Update position and scale
        cube.position.set(currentX, currentY, -5);
        const size = cubeData.current[index].size;
        cube.scale.set(size, size, size);
      }
    });
  });

  const cubes = [];
  for (let i = 0; i < 45; i++) {
    cubes.push(
      <mesh 
        key={i}
        ref={(el) => (cubeRefs.current[i] = el)}
        position={[0, 0, -5]} // Initial position, will be updated in useFrame
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
  }

  return <>{cubes}</>;
};

export default AsteroidBelt;