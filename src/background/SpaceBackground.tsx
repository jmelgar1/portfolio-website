import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Starfield from "./stars/star-field/Starfield";
import ShootingStars from "./stars/shooting-star/ShootingStars";
import Galaxy from "./galaxy/Galaxy";
import MouseCameraController from "../camera-controller/MouseCameraController";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";
import IntroSection from "../components/content/intro-section/IntroSection";
import ProjectsSection from "../components/content/projects-section/ProjectsSection";
import WorkHistory from "../components/content/work-history/WorkHistory";
import { MouseProvider } from "../context/MouseContext";
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
            />
            <Starfield />
            <ShootingStars />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
          </Suspense>
        </Canvas>

        {/* Simple Navigation */}
        <nav className="simple-nav">
          <button 
            className={`nav-item ${getCurrentSection() === 0 ? 'active' : ''}`}
            onClick={() => scrollToSection(0)}
          >
            About Me
          </button>
          <button 
            className={`nav-item ${getCurrentSection() === 1 ? 'active' : ''}`}
            onClick={() => scrollToSection(1)}
          >
            Projects
          </button>
          <button 
            className={`nav-item ${getCurrentSection() === 2 ? 'active' : ''}`}
            onClick={() => scrollToSection(2)}
          >
            Experience
          </button>
        </nav>

        <div
          className="content-sections"
          style={{ transform: `translateX(-${scrollPosition}vw)` }}
        >
          <IntroSection />
          <ProjectsSection />
          <WorkHistory />
        </div>
      </div>
    </MouseProvider>
  );
};

export default SpaceBackground;
