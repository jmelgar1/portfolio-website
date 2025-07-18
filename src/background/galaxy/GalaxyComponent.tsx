import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Galaxy } from './objects/Galaxy';

interface GalaxyComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const GalaxyComponent: React.FC<GalaxyComponentProps> = ({ 
  position = [0, 0, -500], 
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const galaxyRef = useRef<Galaxy | null>(null);
  const { scene, camera } = useThree();
  
  useEffect(() => {
    // Create galaxy instance
    const galaxy = new Galaxy(scene);
    galaxyRef.current = galaxy;
    
    // Apply transformations to all galaxy objects
    if (position) {
      galaxy.stars.forEach(star => {
        if (star.obj) {
          star.obj.position.add(new THREE.Vector3(...position));
        }
      });
      galaxy.haze.forEach(haze => {
        if (haze.obj) {
          haze.obj.position.add(new THREE.Vector3(...position));
        }
      });
    }
    
    if (rotation) {
      const euler = new THREE.Euler(...rotation);
      galaxy.stars.forEach(star => {
        if (star.obj) {
          star.obj.position.applyEuler(euler);
        }
      });
      galaxy.haze.forEach(haze => {
        if (haze.obj) {
          haze.obj.position.applyEuler(euler);
        }
      });
    }
    
    if (scale !== 1) {
      galaxy.stars.forEach(star => {
        if (star.obj) {
          star.obj.position.multiplyScalar(scale);
        }
      });
      galaxy.haze.forEach(haze => {
        if (haze.obj) {
          haze.obj.position.multiplyScalar(scale);
        }
      });
    }
    
    return () => {
      // Cleanup galaxy objects
      galaxy.stars.forEach(star => {
        if (star.obj) {
          scene.remove(star.obj);
        }
      });
      galaxy.haze.forEach(haze => {
        if (haze.obj) {
          scene.remove(haze.obj);
        }
      });
    };
  }, [scene, position, rotation, scale]);

  useFrame(() => {
    if (galaxyRef.current) {
      galaxyRef.current.updateScale(camera);
    }
  });

  return null;
};

export default GalaxyComponent;