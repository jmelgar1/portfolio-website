import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Starfield from './stars/star-field/Starfield';
import ShootingStars from './stars/shooting-star/ShootingStars';
import './ThreeJSBackground.css';

interface ThreeJSBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
}


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
          <Starfield />
          <ShootingStars />

          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeJSBackground;