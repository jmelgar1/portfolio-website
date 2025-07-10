import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import './ThreeJSBackground.css';

interface ThreeJSBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
}

const Starfield = () => {
  const starfieldRef = useRef<THREE.Points>(null);
  const starCount = 2000;
  
  // Memoize star positions to prevent regeneration on re-renders
  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 400; // x - wider spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400; // y - wider spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400; // z - wider spread
    }
    return pos;
  }, [starCount]);
  
  return (
    <points ref={starfieldRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={starCount}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent={true}
        opacity={0.8}
        sizeAttenuation={false}
        vertexColors={false}
      />
    </points>
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