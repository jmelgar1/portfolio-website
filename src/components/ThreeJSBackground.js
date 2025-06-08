import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import './ThreeJSBackground.css';

// Static model paths - defined outside component to prevent recreation (TEMPORARY)
const MODEL_PATHS = {
  trees: [
    '/kenny_nature-kit/Models/GLTF format/tree_default.glb',
    '/kenny_nature-kit/Models/GLTF format/tree_oak.glb',
    '/kenny_nature-kit/Models/GLTF format/tree_pineTallA.glb',
    '/kenny_nature-kit/Models/GLTF format/tree_pineTallB.glb',
    '/kenny_nature-kit/Models/GLTF format/tree_simple.glb',
    '/kenny_nature-kit/Models/GLTF format/tree_detailed.glb'
  ],
  rocks: [
    '/kenny_nature-kit/Models/GLTF format/rock_largeA.glb',
    '/kenny_nature-kit/Models/GLTF format/rock_largeB.glb',
    '/kenny_nature-kit/Models/GLTF format/rock_smallA.glb',
    '/kenny_nature-kit/Models/GLTF format/rock_smallB.glb'
  ],
  plants: [
    '/kenny_nature-kit/Models/GLTF format/plant_bush.glb',
    '/kenny_nature-kit/Models/GLTF format/plant_bushLarge.glb',
    '/kenny_nature-kit/Models/GLTF format/grass.glb',
    '/kenny_nature-kit/Models/GLTF format/grass_large.glb'
  ],
  flowers: [
    '/kenny_nature-kit/Models/GLTF format/flower_purpleA.glb',
    '/kenny_nature-kit/Models/GLTF format/flower_redA.glb',
    '/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb'
  ],
  cliffs: [
    '/kenny_nature-kit/Models/GLTF format/cliff_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_large_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_block_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_blockSlope_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_cave_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_corner_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_half_rock.glb',
    '/kenny_nature-kit/Models/GLTF format/cliff_blockDiagonal_rock.glb'
  ]
};

// Component to load and render a single model - simplified without individual parallax
const Model = ({ url, position, rotation = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  useFrame((state) => {
    if (modelRef.current) {
      // Only subtle swaying animation for trees and plants
      if (url.includes('tree') || url.includes('plant') || url.includes('flower')) {
        modelRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() + position[0]) * 0.01;
      }
    }
  });

  return (
    <primitive 
      ref={modelRef}
      object={scene.clone()} 
      position={position} 
      rotation={rotation}
      scale={scale}
    />
  );
};

// Function to generate positions for foreground forest only
const getForestPosition = (index, totalInLayer) => {
  const layerWidth = 30; // Extended width for continuous scene
  const spacing = layerWidth / (totalInLayer + 1);
  const x = -layerWidth/2 + spacing * (index + 1) + (Math.random() - 0.5) * 0.8;
  const z = 1.75 + (Math.random() - 0.5) * 1.2;
  const y = 0;
  
  return [x, y, z];
};

// Function to generate positions for cliff backdrop
const getCliffPosition = (index, totalCliffs) => {
  const cliffWidth = 35; // Wider than forest for complete backdrop
  const spacing = cliffWidth / (totalCliffs + 1);
  const x = -cliffWidth/2 + spacing * (index + 1) + (Math.random() - 0.5) * 2;
  const z = -8 + (Math.random() - 0.5) * 3; // Behind the trees
  const y = -1; // Slightly lower to create natural cliff base
  
  return [x, y, z];
};

const getRandomRotation = () => [0, Math.random() * Math.PI * 0.3, 0];

const NatureScene = ({ scrollPosition = 0 }) => {
  const groupRef = useRef();
  
  // Simple, smooth parallax movement - no choppy layer calculations
  useFrame(() => {
    if (groupRef.current) {
      // Smooth parallax movement - background moves slower than content
      const parallaxSpeed = 0.02; // Adjust this value to control background speed
      groupRef.current.position.x = -scrollPosition * parallaxSpeed;
    }
  });

  // Generate layered forest scene - ONLY ONCE
  const sceneElements = useMemo(() => {
    const elements = [];

    // Add cliff backdrop behind everything
    for (let i = 0; i < 15; i++) {
      const cliffPath = MODEL_PATHS.cliffs[Math.floor(Math.random() * MODEL_PATHS.cliffs.length)];
      elements.push({
        type: 'cliff',
        layer: 'background',
        url: cliffPath,
        position: getCliffPosition(i, 15),
        rotation: getRandomRotation(),
        scale: 1.2 + Math.random() * 0.8 // Larger for dramatic backdrop
      });
    }

    // Foreground trees (larger, closer) - Move fastest
    for (let i = 0; i < 150; i++) {
      const treePath = MODEL_PATHS.trees[Math.floor(Math.random() * MODEL_PATHS.trees.length)];
      elements.push({
        type: 'tree',
        layer: 'foreground',
        url: treePath,
        position: getForestPosition(i, 150),
        rotation: getRandomRotation(),
        scale: 0.8 + Math.random() * 0.5
      });
    }

    // Add rocks in foreground only
    for (let i = 0; i < 35; i++) {
      const rockPath = MODEL_PATHS.rocks[Math.floor(Math.random() * MODEL_PATHS.rocks.length)];
      
      elements.push({
        type: 'rock',
        layer: 'foreground',
        url: rockPath,
        position: getForestPosition(Math.floor(Math.random() * 150), 150),
        rotation: getRandomRotation(),
        scale: 0.3 + Math.random() * 0.15
      });
    }

    // Add plants and grass in foreground only
    for (let i = 0; i < 40; i++) {
      const plantPath = MODEL_PATHS.plants[Math.floor(Math.random() * MODEL_PATHS.plants.length)];
      
      elements.push({
        type: 'plant',
        layer: 'foreground',
        url: plantPath,
        position: getForestPosition(Math.floor(Math.random() * 150), 150),
        rotation: getRandomRotation(),
        scale: 0.4 + Math.random() * 0.15
      });
    }

    // Add flowers in foreground
    for (let i = 0; i < 30; i++) {
      const flowerPath = MODEL_PATHS.flowers[Math.floor(Math.random() * MODEL_PATHS.flowers.length)];
      elements.push({
        type: 'flower',
        layer: 'foreground',
        url: flowerPath,
        position: getForestPosition(Math.floor(Math.random() * 150), 150),
        rotation: getRandomRotation(),
        scale: 0.5 + Math.random() * 0.25
      });
    }

    return elements;
  }, []); // Empty dependency array - generate scene only once

  return (
    <group ref={groupRef}>
      {/* Render all scene elements */}
      {sceneElements.map((element, index) => (
        <Model
          key={index}
          url={element.url}
          position={element.position}
          rotation={element.rotation}
          scale={element.scale}
        />
      ))}
      
      {/* Ground plane - extended to reach cliff backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -3]}>
        <planeGeometry args={[90, 50]} />
        <meshLambertMaterial color="#2d5016" />
      </mesh>

      {/* Foreground ground patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 2]}>
        <planeGeometry args={[60, 15]} />
        <meshLambertMaterial color="#3a6b1a" />
      </mesh>

      {/* Cliff base ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -8]}>
        <planeGeometry args={[70, 20]} />
        <meshLambertMaterial color="#1f3a0d" />
      </mesh>

      {/* Lighting optimized for side view */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[15, 10, 5]} 
        intensity={1.0}
        color="#ffffff"
        castShadow
      />
      <directionalLight 
        position={[-10, 8, -10]} 
        intensity={0.4}
        color="#87CEEB"
      />
    </group>
  );
};

const ThreeJSBackground = ({ scrollPosition = 0 }) => {
  return (
    <div className="threejs-background">
      <Canvas 
        camera={{ position: [0, 0.3, 3], fov: 75 }}
        shadows
      >
        <Suspense fallback={null}>
          <NatureScene scrollPosition={scrollPosition} />
          <Environment preset="forest" />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default ThreeJSBackground; 