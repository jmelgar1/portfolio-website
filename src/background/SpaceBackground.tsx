import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Starfield from './stars/star-field/Starfield';
import ShootingStars from './stars/shooting-star/ShootingStars';
import AstronautHelmet from '../astronaut-helmet/AstronautHelmet';
import { HolographicPanel } from '../astronaut-helmet/holographic-panel/HolographicPanel';
import MouseCameraController from '../camera-controller/MouseCameraController';
import './SpaceBackground.css';

interface SpaceBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
  lookAt?: [number, number, number];
}

const SpaceBackground = ({ lookAt }: SpaceBackgroundProps) => {
  return (
    <div className="space-background">
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
          <AstronautHelmet>
            <HolographicPanel
              position={[-2, -0.8, 2.3]}
              rotation={[0.5, -0.8, 0]}
              title={"TITLE"}
              status={"STATUS"}
              description={"DESCRIPTION"}
              onClick={() => console.log('Holographic panel activated!')}
              attachedToHelmet={true}
            />
            <HolographicPanel
              position={[0, -0.8, 2.3]}
              rotation={[0, 0, 0]}
              title={"Welcome to my website!"}
              status={"Status thing here"}
              description={"Description here"}
              onClick={() => console.log('Welcome!')}
              attachedToHelmet={true}
            />
          </AstronautHelmet>

          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceBackground;