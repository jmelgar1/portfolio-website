import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Camera, Vector3, Euler } from 'three';
import Starfield from './stars/star-field/Starfield';
import ShootingStars from './stars/shooting-star/ShootingStars';
import AstronautHelmet from '../astronaut-helmet/AstronautHelmet';
import { HolographicPanel } from '../components/holographic-panel/HolographicPanel';
import './ThreeJSBackground.css';

interface ThreeJSBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
  lookAt?: [number, number, number];
}

const MouseCameraController = ({ lookAt }: { lookAt?: [number, number, number] }) => {
  const { camera, gl } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const defaultRotation = useRef({ x: 0, y: 0 });
  const lastMouseActivity = useRef(Date.now());
  
  // Store default rotation on mount
  useEffect(() => {
    if (lookAt) {
      camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
      defaultRotation.current = { x: camera.rotation.x, y: camera.rotation.y };
    } else {
      // Store current rotation as default if no lookAt specified
      defaultRotation.current = { x: camera.rotation.x, y: camera.rotation.y };
    }
  }, [camera, lookAt]);

  // Mouse move handler - use window instead of canvas
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      setMousePosition({ x, y });
      lastMouseActivity.current = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth camera rotation and auto-return
  useFrame(() => {
    const timeSinceLastMove = Date.now() - lastMouseActivity.current;
    const returnDelay = 2000;
    const lerpFactor = 0.1; // Increased for more responsive movement
    const sensitivity = 0.3; // Increased sensitivity
    
    let targetX, targetY;
    
    if (timeSinceLastMove > returnDelay) {
      // Return to default position
      targetX = defaultRotation.current.x;
      targetY = defaultRotation.current.y;
    } else {
      // Follow mouse - apply rotation directly based on mouse position
      const maxUpRotation = Math.PI / 6; // 30 degrees up
      const maxDownRotation = Math.PI / 20; // 7.5 degrees down
      const maxHorizontalRotation = Math.PI / 2; // 90 degrees left/right
      
      const rawTargetX = defaultRotation.current.x + mousePosition.y * sensitivity;
      const rawTargetY = defaultRotation.current.y - mousePosition.x * sensitivity;
      
      // Clamp rotations to limits with different up/down ranges
      targetX = Math.max(
        defaultRotation.current.x - maxDownRotation,
        Math.min(defaultRotation.current.x + maxUpRotation, rawTargetX)
      );
      targetY = Math.max(
        defaultRotation.current.y - maxHorizontalRotation,
        Math.min(defaultRotation.current.y + maxHorizontalRotation, rawTargetY)
      );
    }
    
    // Apply smooth interpolation
    camera.rotation.x += (targetX - camera.rotation.x) * lerpFactor;
    camera.rotation.y += (targetY - camera.rotation.y) * lerpFactor;
  });
  
  return null;
};


const ThreeJSBackground = ({ lookAt }: ThreeJSBackgroundProps) => {
  return (
    <div className="threejs-background">
      <Canvas 
        camera={{ position: [0, 2.2, 1.6], fov: 40 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <MouseCameraController lookAt={lookAt} />
          <Starfield />
          <ShootingStars />
          <AstronautHelmet />
          <HolographicPanel
            position={[2, 0, -0.5]}
            rotation={[0, -0.5, 0]}
            onClick={() => console.log('Holographic panel activated!')}
          />

          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeJSBackground;