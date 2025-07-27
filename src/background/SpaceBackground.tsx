import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Starfield from "./stars/star-field/Starfield";
import ShootingStars from "./stars/shooting-star/ShootingStars";
import Galaxy from "./galaxy/Galaxy";
import MouseCameraController from "../camera-controller/MouseCameraController";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";
import { MouseProvider } from "../context/MouseContext";
import GalaxyDebugOverlay from "../components/ui/GalaxyDebugOverlay";
import GithubIcon from "../assets/icons/github.svg?react";
import LinkedinIcon from "../assets/icons/linkedin.svg?react";
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

  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    type: string;
    seed: number;
    width: number;
    height: number;
    depth: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    totalParticles: number;
    transformationProgress: number;
    mouseVelocity: number;
    isTransforming: boolean;
  } | null>(null);

  // Add keyboard shortcut for debug toggle (Ctrl+D or Cmd+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDebugUpdate = (newDebugInfo: typeof debugInfo) => {
    if (showDebug) {
      setDebugInfo(newDebugInfo);
    }
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

        {/* Debug overlay */}
        <GalaxyDebugOverlay debugInfo={debugInfo} visible={showDebug} />

        {/* Debug indicator */}
        {showDebug && (
          <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#4da6ff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 999
          }}>
            Debug Mode Active - Press Ctrl+D to toggle
          </div>
        )}

        {/* Bottom Left Buttons */}
        <div className="bottom-left-buttons">
          <button className="resume-button">
            MY RESUME
          </button>
          <button className="icon-button github-button">
            <GithubIcon />
          </button>
          <button className="icon-button linkedin-button">
            <LinkedinIcon />
          </button>
        </div>

        {/* Simple Navigation */}
        <nav className="simple-nav">
          <button 
            className={`nav-item ${getCurrentSection() === 0 ? 'active' : ''}`}
            onClick={() => scrollToSection(0)}
          >
            ABOUT ME
          </button>
          <button 
            className={`nav-item ${getCurrentSection() === 1 ? 'active' : ''}`}
            onClick={() => scrollToSection(1)}
          >
            PROJECTS
          </button>
          <button 
            className={`nav-item ${getCurrentSection() === 2 ? 'active' : ''}`}
            onClick={() => scrollToSection(2)}
          >
            EXPERIENCE
          </button>
        </nav>

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
