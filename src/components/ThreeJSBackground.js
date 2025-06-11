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

// Individual Cloud Component - Creates blob-like shape from spheres
const Cloud = ({ position, scale = 1, speed = 1 }) => {
  const cloudRef = useRef();
  const initialX = useRef(position[0]);
  
  useFrame((state) => {
    if (cloudRef.current) {
      // Move cloud from left to right
      const elapsedTime = state.clock.getElapsedTime();
      const movementSpeed = speed * 0.5;
      
      // Reset cloud position when it goes too far right
      const newX = initialX.current + (elapsedTime * movementSpeed) % 120;
      cloudRef.current.position.x = newX > 60 ? newX - 120 : newX;
      
      // Subtle floating animation
      cloudRef.current.position.y = position[1] + Math.sin(elapsedTime * 0.3 + position[0]) * 0.2;
    }
  });

  // Create blob-like cloud from multiple spheres
  const cloudParts = [
    { pos: [0, 0, 0], scale: 1.0 },      // Main body
    { pos: [-0.8, 0.2, 0.1], scale: 0.7 }, // Left bump
    { pos: [0.8, 0.1, -0.1], scale: 0.8 }, // Right bump
    { pos: [0.2, 0.6, 0.2], scale: 0.6 },  // Top bump
    { pos: [-0.3, 0.4, -0.2], scale: 0.5 }, // Top left
    { pos: [0.4, 0.3, 0.3], scale: 0.4 },  // Top right
  ];

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {cloudParts.map((part, index) => (
        <mesh key={index} position={part.pos} scale={part.scale}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
};

// Cloud System Component - Manages multiple clouds
const CloudSystem = () => {
  // Generate cloud configurations
  const clouds = React.useMemo(() => {
    const cloudConfigs = [];
    const numClouds = 12; // Number of clouds in the sky
    
    for (let i = 0; i < numClouds; i++) {
      cloudConfigs.push({
        id: i,
        position: [
          -60 + Math.random() * 120,  // X: Spread across wide area
          18 + Math.random() * 12,    // Y: High sky height (18-30 units up)
          -40 + Math.random() * 15    // Z: Far behind trees (-40 to -25 units back)
        ],
        scale: 0.8 + Math.random() * 1.2,  // Random size (0.8 - 2.0)
        speed: 0.5 + Math.random() * 1.0   // Random speed (0.5 - 1.5)
      });
    }
    
    return cloudConfigs;
  }, []);

  return (
    <group>
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
        />
      ))}
    </group>
  );
};

// Component for smooth valley terrain with natural curves
const ValleyTerrain = () => {
  const terrainRef = useRef();
  
  // Helper function to create a subtle valley displacement
  const applyValleyDisplacement = (geometry, intensity = 1, frequency = 1) => {
    const vertices = geometry.attributes.position.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Create a subtle valley - lowest at center, rising toward edges
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const valleyDepth = (distanceFromCenter * distanceFromCenter) * 0.002 * intensity;
      
      // Add subtle natural variation to avoid perfectly smooth valley
      const naturalVariation1 = Math.sin(x * 0.02 * frequency) * (0.15 * intensity);
      const naturalVariation2 = Math.sin(z * 0.025 * frequency) * (0.12 * intensity);
      const naturalVariation3 = Math.sin(x * 0.03 * frequency + z * 0.02 * frequency) * (0.08 * intensity);
      
      // Combine valley shape with subtle natural variations
      const elevation = valleyDepth + naturalVariation1 + naturalVariation2 + naturalVariation3;
      vertices[i + 2] = elevation;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  // Create main valley terrain
  const createMainTerrain = () => {
    const geometry = new THREE.PlaneGeometry(100, 60, 120, 80);
    return applyValleyDisplacement(geometry, 1.0, 1.0);
  };

  // Create foreground valley
  const createForegroundValley = () => {
    const geometry = new THREE.PlaneGeometry(80, 20, 60, 20);
    return applyValleyDisplacement(geometry, 0.8, 1.2);
  };

  // Create background valley
  const createBackgroundValley = () => {
    const geometry = new THREE.PlaneGeometry(140, 50, 80, 30);
    return applyValleyDisplacement(geometry, 0.6, 0.8);
  };

  const mainGeometry = createMainTerrain();
  const foregroundGeometry = createForegroundValley();
  const backgroundGeometry = createBackgroundValley();
  
  return (
    <group>
      {/* Main valley terrain - light green grass */}
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <primitive object={mainGeometry} />
        <meshLambertMaterial 
          color="#90EE90"
          wireframe={false}
        />
      </mesh>
      
      {/* Foreground valley - bright light green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 8]} receiveShadow>
        <primitive object={foregroundGeometry} />
        <meshLambertMaterial color="#98FB98" />
      </mesh>
      
      {/* Background valley - slightly muted light green */}
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
      
      {/* Valley terrain with smooth curves and light green grass */}
      <ValleyTerrain />

      {/* Realistic Sun Lighting System */}
      <SunLighting />

      {/* Animated Cloud System */}
      <CloudSystem />
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