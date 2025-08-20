import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTerrainWorker } from '../../../workers/useTerrainWorker';

interface MountainTerrainProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  length?: number;
  maxHeight?: number;
  segments?: number;
  seed?: number;
}

const MountainTerrain = ({
  position = [0, -15, -30],
  rotation = [-Math.PI / 2, 0, 0],
  width = 450,
  length = 300, // width:length ratio of 1.5
  maxHeight = 300,
  segments = 92,
  seed = Math.random()
}: MountainTerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState<THREE.Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { generateTerrain, isWorkerReady, cleanup } = useTerrainWorker();

  // Generate terrain using Web Worker
  useEffect(() => {
    let isCancelled = false;
    
    const generateTerrainData = async () => {
      if (!isWorkerReady) {
        setError('Worker not ready');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await generateTerrain({
          width,
          length,
          maxHeight,
          segments,
          seed
        });
        
        if (isCancelled) return;
        
        // Create plane geometry with specified segments
        const geo = new THREE.PlaneGeometry(width, length, segments, segments);
        
        // Update positions with generated data
        const positions = geo.attributes.position;
        for (let i = 0; i < result.positions.length; i += 3) {
          positions.setXYZ(
            i / 3, // vertex index
            result.positions[i],     // x
            result.positions[i + 1], // y
            result.positions[i + 2]  // z
          );
        }
        
        // Add color attribute to geometry
        geo.setAttribute('color', new THREE.BufferAttribute(result.colors, 3));
        
        positions.needsUpdate = true;
        geo.computeVertexNormals();
        
        // Create blended material for mountain look
        const mat = new THREE.MeshLambertMaterial({
          vertexColors: true, // Enable vertex colors
          flatShading: false, // Smooth shading
          side: THREE.DoubleSide,
        });
        
        setGeometry(geo);
        setMaterial(mat);
        setIsLoading(false);
        
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate terrain');
          setIsLoading(false);
        }
      }
    };
    
    generateTerrainData();
    
    return () => {
      isCancelled = true;
    };
  }, [width, length, maxHeight, segments, seed, isWorkerReady, generateTerrain]);
  
  // Cleanup worker on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Handle loading and error states
  if (error) {
    console.error('MountainTerrain error:', error);
    return null; // Fail silently to not break the scene
  }
  
  if (isLoading || !geometry || !material) {
    return null; // Return nothing while loading to prevent Three.js warnings
  }

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