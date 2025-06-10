import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { getSceneConfig, validateSceneConfig } from '../config/scenes';
import './ThreeJSBackground.css';

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

  // Enable shadows on the model
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

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

// Component for smooth, hilly terrain with natural curves
const HillyTerrain = () => {
  const terrainRef = useRef();
  
  // Helper function to apply smooth hill displacement to any geometry
  const applyHillDisplacement = (geometry, intensity = 1, frequency = 1) => {
    const vertices = geometry.attributes.position.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Create gentle rolling hills with multiple wave frequencies
      const hill1 = Math.sin(x * 0.015 * frequency) * (1.2 * intensity);
      const hill2 = Math.sin(z * 0.02 * frequency) * (0.9 * intensity);
      const hill3 = Math.sin(x * 0.03 * frequency + z * 0.025 * frequency) * (0.6 * intensity);
      const hill4 = Math.cos(x * 0.02 * frequency + z * 0.015 * frequency) * (0.4 * intensity);
      const hill5 = Math.sin(x * 0.05 * frequency + z * 0.04 * frequency) * (0.2 * intensity);
      const hill6 = Math.cos(x * 0.04 * frequency - z * 0.03 * frequency) * (0.15 * intensity);
      
      // Combine all waves for natural, smooth terrain
      const elevation = hill1 + hill2 + hill3 + hill4 + hill5 + hill6;
      vertices[i + 2] = elevation;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  // Create main hilly terrain
  const createMainTerrain = () => {
    const geometry = new THREE.PlaneGeometry(100, 60, 120, 80);
    return applyHillDisplacement(geometry, 1.0, 1.0);
  };

  // Create foreground hills
  const createForegroundHills = () => {
    const geometry = new THREE.PlaneGeometry(80, 20, 60, 20);
    return applyHillDisplacement(geometry, 0.8, 1.2);
  };

  // Create background hills
  const createBackgroundHills = () => {
    const geometry = new THREE.PlaneGeometry(140, 50, 80, 30);
    return applyHillDisplacement(geometry, 0.6, 0.8);
  };

  const mainGeometry = createMainTerrain();
  const foregroundGeometry = createForegroundHills();
  const backgroundGeometry = createBackgroundHills();
  
  return (
    <group>
      {/* Main hilly terrain - light green grass */}
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <primitive object={mainGeometry} />
        <meshLambertMaterial 
          color="#90EE90"
          wireframe={false}
        />
      </mesh>
      
      {/* Foreground rolling hills - bright light green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 8]} receiveShadow>
        <primitive object={foregroundGeometry} />
        <meshLambertMaterial color="#98FB98" />
      </mesh>
      
      {/* Background gentle hills - slightly muted light green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, -20]} receiveShadow>
        <primitive object={backgroundGeometry} />
        <meshLambertMaterial color="#8FBC8F" />
      </mesh>
    </group>
  );
};

// Realistic Sun Lighting Component
const SunLighting = () => {
  const sunRef = useRef();
  const volumetricRef = useRef();
  
  // Sun position (top right, elevated)
  const sunPosition = [25, 20, 15];
  
  useFrame((state) => {
    // Subtle sun movement simulation (very slow)
    if (sunRef.current) {
      const time = state.clock.getElapsedTime() * 0.02;
      sunRef.current.position.x = sunPosition[0] + Math.sin(time) * 2;
      sunRef.current.position.y = sunPosition[1] + Math.cos(time) * 0.5;
    }

    // Animate volumetric light rays
    if (volumetricRef.current) {
      const time = state.clock.getElapsedTime() * 0.5;
      volumetricRef.current.rotation.z = Math.sin(time) * 0.02;
      volumetricRef.current.material.opacity = 0.15 + Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group>
      {/* Main Sun Light - Directional from top right */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        intensity={2.5}
        color="#FFF8DC" // Warm sunlight color
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />

      {/* Ambient Light - Sky illumination */}
      <ambientLight 
        intensity={0.4} 
        color="#87CEEB" // Sky blue tint
      />

      {/* Fill Light - Bounce light from opposite side */}
      <directionalLight
        position={[-15, 8, -5]}
        intensity={0.3}
        color="#B0E0E6" // Soft blue fill light
      />

      {/* Atmospheric/Rim Light - For depth */}
      <directionalLight
        position={[0, 5, -30]}
        intensity={0.2}
        color="#FFE4B5" // Warm atmospheric light
      />

      {/* Volumetric Light Rays Effect */}
      <mesh
        ref={volumetricRef}
        position={[20, 15, 10]}
        rotation={[0, 0, -Math.PI / 6]}
      >
        <coneGeometry args={[15, 40, 8, 1, true]} />
        <meshBasicMaterial
          color="#FFFACD"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Additional Light Ray Cones for depth */}
      <mesh position={[18, 12, 8]} rotation={[0, 0, -Math.PI / 5]}>
        <coneGeometry args={[12, 35, 6, 1, true]} />
        <meshBasicMaterial
          color="#F0E68C"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[22, 18, 12]} rotation={[0, 0, -Math.PI / 7]}>
        <coneGeometry args={[10, 30, 6, 1, true]} />
        <meshBasicMaterial
          color="#FFFFF0"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sun Glow Effect */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial
          color="#FFFF00"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Larger Sun Halo */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial
          color="#FFF8DC"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const NatureScene = ({ scrollPosition = 0, sceneName = 'forestScene' }) => {
  const groupRef = useRef();
  
  // Load the static scene configuration
  const sceneConfig = getSceneConfig(sceneName);
  
  // Simple, smooth parallax movement - no choppy layer calculations
  // Hook must be called before any early returns
  useFrame(() => {
    if (groupRef.current) {
      // Smooth parallax movement - background moves slower than content
      const parallaxSpeed = 0.02; // Adjust this value to control background speed
      groupRef.current.position.x = -scrollPosition * parallaxSpeed;
    }
  });

  // Validate scene configuration after hooks are called
  if (!sceneConfig || !validateSceneConfig(sceneConfig)) {
    console.error(`Invalid or missing scene configuration: ${sceneName}`);
    return null;
  }

  // Get scene elements from static configuration
  const sceneElements = sceneConfig.elements;

  return (
    <group ref={groupRef}>
      {/* Render all scene elements */}
      {sceneElements.map((element) => (
        <Model
          key={element.id}
          url={element.url}
          position={element.position}
          rotation={element.rotation}
          scale={element.scale}
        />
      ))}
      
      {/* Hilly terrain with smooth curves and light green grass */}
      <HillyTerrain />

      {/* Realistic Sun Lighting System */}
      <SunLighting />
    </group>
  );
};

const ThreeJSBackground = ({ scrollPosition = 0, sceneName = 'forestScene' }) => {
  return (
    <div className="threejs-background">
      <Canvas 
        camera={{ position: [0, 0.2, 6], fov: 75 }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <NatureScene scrollPosition={scrollPosition} sceneName={sceneName} />
          <Environment preset="sunset" intensity={0.3} />
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