import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Starfield from "./stars/star-field/Starfield";
import ShootingStars from "./stars/shooting-star/ShootingStars";
import Galaxy from "./galaxy/Galaxy";
import MouseCameraController from "./camera-controller/MouseCameraController";
import { MouseProvider } from "./stars/star-field/context/MouseContext";
import Navigation from "./ui/Navigation";
import SocialButtons from "./ui/SocialButtons";
import DebugControls, { DebugInfo } from "./ui/debug/DebugControls";
import "./SpaceBackground.css";

interface SpaceBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
  lookAt?: [number, number, number];
}

const SpaceBackground = ({ lookAt }: SpaceBackgroundProps) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const handleDebugUpdate = (newDebugInfo: DebugInfo | null) => {
    setDebugInfo(newDebugInfo);
  };

  // Track component lifecycle for GPU optimization monitoring
  useEffect(() => {
    console.log('🚀 SpaceBackground MOUNTED - GPU resources allocated');
    return () => {
      console.log('💾 SpaceBackground UNMOUNTED - GPU resources freed');
    };
  }, []);


  return (
    <MouseProvider>
      <div className="space-background">
        <Canvas
          camera={{ position: [0, 0, 0], fov: 40, rotation: [0, 0, 0] }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={null}>
            <MouseCameraController lookAt={lookAt} />
            <Galaxy
              position={[0, 50, 0]}
              rotation={[0, 0, 2]}
              scale={1.5}
              onDebugUpdate={handleDebugUpdate}
            />
            <Starfield 
              cameraPosition={{ x: 0, y: 0, z: 0 }} 
              enableMouseInteraction={true}
              cameraOrientation="y-axis"
            />
            <ShootingStars />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
          </Suspense>
        </Canvas>

        <DebugControls debugInfo={debugInfo} />
        <SocialButtons />
        <Navigation />
      </div>
    </MouseProvider>
  );
};

export default SpaceBackground;
