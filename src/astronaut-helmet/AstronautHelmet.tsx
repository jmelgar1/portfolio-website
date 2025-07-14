import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Group } from 'three';

interface AstronautHelmetProps {
  children?: React.ReactNode;
}

const AstronautHelmet: React.FC<AstronautHelmetProps> = ({ children }) => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, '/space_helmet.glb');

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={[3, 3, 3]}>
      <primitive object={gltf.scene} />
      {children}
    </group>
  );
};

export default AstronautHelmet;