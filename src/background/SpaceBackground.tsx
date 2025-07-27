import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Starfield from "./stars/star-field/Starfield";
import ShootingStars from "./stars/shooting-star/ShootingStars";
import Galaxy from "./galaxy/Galaxy";
import MouseCameraController from "../camera-controller/MouseCameraController";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";
import { MouseProvider } from "../context/MouseContext";
import Navigation from "../components/ui/Navigation";
import SocialButtons from "../components/ui/SocialButtons";
import DebugControls, { DebugInfo } from "../components/ui/DebugControls";
import "./SpaceBackground.css";

interface SpaceBackgroundProps {
  scrollPosition?: number;
  maxScroll?: number;
  lookAt?: [number, number, number];
}

const SpaceBackground = ({ lookAt }: SpaceBackgroundProps) => {
  const {
    scrollPosition,
    scrollToSection,
    getCurrentSection
  } = useHorizontalScroll(200);

  const handleDebugUpdate = (newDebugInfo: DebugInfo | null) => {
    // Debug update is now handled by DebugControls component
  };

  return (
    <MouseProvider>
      <div className="space-background">
        <Canvas
          camera={{ position: [0, 1.5, 1], fov: 40 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={null}>
            <MouseCameraController lookAt={lookAt} />
            <Galaxy
              position={[0, -3.5, -40]}
              rotation={[0, 0, 2]}
              scale={1.5}
              onDebugUpdate={handleDebugUpdate}
            />
            <Starfield />
            <ShootingStars />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
          </Suspense>
        </Canvas>

        <DebugControls onDebugUpdate={handleDebugUpdate} />
        <SocialButtons />
        <Navigation 
          getCurrentSection={getCurrentSection}
          scrollToSection={scrollToSection}
        />

        <div
          className="content-sections"
          style={{ transform: `translateX(-${scrollPosition}vw)` }}
        >
          {/* <IntroSection />
          <ProjectsSection />
          <WorkHistory /> */}
        </div>
      </div>
    </MouseProvider>
  );
};

export default SpaceBackground;
