import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './ThreeJSBackground.css';

interface ThreeJSBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
}

const TwinklingStarGroup = ({ positions, phase, speed }: { positions: Float32Array, phase: number, speed: number }) => {
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Each group has its own phase and speed for independent twinkling
      const opacity = 0.7 + Math.sin(clock.elapsedTime * speed + phase) * 0.3;
      materialRef.current.opacity = Math.max(0.2, opacity);
    }
  });
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color="#ffffff"
        transparent={true}
        opacity={1.0}
        sizeAttenuation={false}
      />
    </points>
  );
};

const Starfield = () => {
  const twinklingStars = 800; // Reasonable twinkling count
  const staticStars = 1500; // Reasonable static count  
  const twinklingGroups = 25; // Fewer groups for better performance
  
  // Memoize star data to prevent regeneration on re-renders
  const starData = useMemo(() => {
    // Camera settings (matching the Canvas camera prop)
    const cameraFov = 75;
    const cameraAspect = window.innerWidth / window.innerHeight;
    const cameraPosition = 5;
    
    // Calculate frustum dimensions at various depths
    const generateStarInFrustum = (depth: number) => {
      const fovRad = (cameraFov * Math.PI) / 180;
      const halfHeight = Math.tan(fovRad / 2) * depth;
      const halfWidth = halfHeight * cameraAspect;
      
      return {
        x: (Math.random() - 0.5) * 2 * halfWidth,
        y: (Math.random() - 0.5) * 2 * halfHeight,
        z: -depth
      };
    };
    
    // Create static stars
    const staticPositions = new Float32Array(staticStars * 3);
    for (let i = 0; i < staticStars; i++) {
      const depth = Math.random() * 400; // Random depth from 0 to 400
      const star = generateStarInFrustum(depth);
      staticPositions[i * 3] = star.x;
      staticPositions[i * 3 + 1] = star.y;
      staticPositions[i * 3 + 2] = star.z;
    }
    
    // Create twinkling groups
    const groups = [];
    const starsPerGroup = Math.floor(twinklingStars / twinklingGroups);
    
    for (let g = 0; g < twinklingGroups; g++) {
      const groupPositions = new Float32Array(starsPerGroup * 3);
      for (let i = 0; i < starsPerGroup; i++) {
        const depth = Math.random() * 400; // Random depth from 0 to 400
        const star = generateStarInFrustum(depth);
        groupPositions[i * 3] = star.x;
        groupPositions[i * 3 + 1] = star.y;
        groupPositions[i * 3 + 2] = star.z;
      }
      
      groups.push({
        positions: groupPositions,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.5 // Slower, more subtle twinkling
      });
    }
    
    return { staticPositions, groups };
  }, [staticStars, twinklingGroups]);
  
  return (
    <group>
      {/* Static stars that don't twinkle */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starData.staticPositions}
            count={staticStars}
            itemSize={3}
            args={[starData.staticPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent={true}
          opacity={1.0}
          sizeAttenuation={false}
        />
      </points>
      
      {/* Twinkling star groups */}
      {starData.groups.map((group, index) => (
        <TwinklingStarGroup
          key={index}
          positions={group.positions}
          phase={group.phase}
          speed={group.speed}
        />
      ))}
    </group>
  );
};

const ThreeJSBackground = ({ scrollPosition = 0, maxScroll = 350 }: ThreeJSBackgroundProps) => {
  return (
    <div className="threejs-background">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          {/* Static starfield background */}
          <Starfield />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeJSBackground;