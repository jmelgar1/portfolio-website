import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Group, Vector3 } from 'three';

interface AstronautHelmetProps {
  children?: React.ReactNode;
}

const AstronautHelmet: React.FC<AstronautHelmetProps> = ({ children }) => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, '/space_helmet.glb');
  const { camera } = useThree();
  
  const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });

  // Initialize camera position inside helmet
  useEffect(() => {
    const cameraOffset = new Vector3(0, 0.2, 0.3);
    camera.position.copy(position.clone().add(cameraOffset));
  }, [camera, position]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 5;
    const moveVector = new Vector3(0, 0, 0);

    if (keys.w) moveVector.z -= speed * delta;
    if (keys.s) moveVector.z += speed * delta;
    if (keys.a) moveVector.x -= speed * delta;
    if (keys.d) moveVector.x += speed * delta;

    if (moveVector.length() > 0) {
      const newPosition = position.clone().add(moveVector);
      setPosition(newPosition);
      
      // Move camera with helmet - position camera inside the helmet
      // Offset camera slightly forward and up to simulate being inside
      const cameraOffset = new Vector3(0, 0.2, 0.3);
      camera.position.copy(newPosition.clone().add(cameraOffset));
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[position.x, position.y, position.z]} 
      rotation={[0, Math.PI, 0]} 
      scale={[3, 3, 3]}
    >
      <primitive object={gltf.scene} />
      {children}
    </group>
  );
};

export default AstronautHelmet;