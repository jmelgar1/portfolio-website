import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Starfield from './stars/star-field/Starfield';
import ShootingStars from './stars/shooting-star/ShootingStars';
import HyperDriveStars from './stars/hyperdrive/HyperDriveStars';
import AstronautHelmet from '../astronaut-helmet/AstronautHelmet';
import { HolographicPanel } from '../astronaut-helmet/holographic-panel/HolographicPanel';
import MouseCameraController from '../camera-controller/MouseCameraController';
import ModeToggle from '../components/ui/ModeToggle';
import './SpaceBackground.css';

interface SpaceBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
  lookAt?: [number, number, number];
}

const SpaceBackground = ({ lookAt }: SpaceBackgroundProps) => {
  const [isHyperdriveMode, setIsHyperdriveMode] = useState(false);

  return (
    <div className="space-background">
      <ModeToggle 
        isHyperdriveMode={isHyperdriveMode} 
        onToggle={setIsHyperdriveMode} 
      />
      <Canvas 
        camera={{ position: [0, 2, 1.1], fov: 40 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <MouseCameraController lookAt={lookAt} />
          {isHyperdriveMode ? (
            <HyperDriveStars />
          ) : (
            <>
              <Starfield />
              <ShootingStars />
            </>
          )}
          <AstronautHelmet>
              <HolographicPanel
                  position={[2, -0.6, 1.3]}
                  rotation={[0.7, 0.8, 0]}
                  title={"Hologram1"}
                  status={"STATUS"}
                  description={"DESCRIPTION"}
                  width={0.6}
                  height={0.3}
                  onClick={() => console.log('Holographic panel activated!')}
                  attachedToHelmet={true}
              />
              <HolographicPanel
                  position={[0, -1, 1.6]}
                  rotation={[1, 0, 0]}
                  title={"Welcome to my website!"}
                  status={"Status thing here"}
                  description={"Description here"}
                  width={0.8}
                  height={0.4}
                  onClick={() => console.log('Welcome!')}
                  attachedToHelmet={true}
              />
              <HolographicPanel
                  position={[-2, -0.6, 1.3]}
                  rotation={[0.7, -0.8, 0]}
                  title={"Hologram3"}
                  status={"STATUS"}
                  description={"DESCRIPTION"}
                  width={0.6}
                  height={0.3}
                  onClick={() => console.log('Holographic panel activated!')}
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