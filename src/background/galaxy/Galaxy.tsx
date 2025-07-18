import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as config from './config/galaxyConfig';

interface GalaxyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const Galaxy: React.FC<GalaxyProps> = ({ 
  position = [0, 0, -10], 
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const galaxyRef = useRef<THREE.Points>(null);
  
  const parameters = {
    size: 0.005,
    count: config.NUM_STARS,
    branches: config.ARMS,
    radius: config.ARM_X_MEAN / 25,
    spin: config.SPIRAL,
    randomness: config.HAZE_RATIO,
    randomnessPower: config.ARMS_CONSTANT,
    insideColor: 0xff6030,
    outsideColor: 0x391eb9,
  };

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      
      // Calculate branch angle
      const branchAngle = ((i % parameters.branches) / parameters.branches) * (Math.PI * 2);
      
      // Calculate radius with power distribution for more density at center
      const radius = Math.pow(Math.random(), parameters.randomnessPower) * parameters.radius;
      
      // Calculate spin
      const spin = radius * parameters.spin;
      
      // Calculate color mixing based on radius
      const currentColor = colorInside.clone();
      currentColor.lerp(colorOutside, radius / parameters.radius);
      
      // Add randomness
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;

      // Set positions
      positions[i3] = Math.cos(branchAngle + spin) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ;

      // Set colors
      colors[i3] = currentColor.r;
      colors[i3 + 1] = currentColor.g;
      colors[i3 + 2] = currentColor.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={galaxyRef} position={position} rotation={rotation} scale={scale}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={parameters.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={parameters.count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={parameters.size}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        alphaTest={0.001}
        depthWrite={false}
      />
    </points>
  );
};

export default Galaxy;