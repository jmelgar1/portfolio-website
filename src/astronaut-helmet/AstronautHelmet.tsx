import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Group } from 'three';

const AstronautHelmet = () => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, '/space_helmet.glb');

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={[3, 3, 3]}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default AstronautHelmet;