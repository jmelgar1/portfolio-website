import React, { useState, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import OverlayNavigation from "./OverlayNavigation";
import { useOverlay } from "./context/NavigationOverlayContext";
import Starfield from '../background/stars/star-field/Starfield';
import AsteroidBelt from './pages/about-page/asteroid-belt/AsteroidBelt';
import DynamicAmbientLight from './DynamicAmbientLight';
import "./OverlayPage.css";

interface OverlayPageProps {
  children: React.ReactNode;
}

const OverlayPage = ({ children }: OverlayPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeOverlay } = useOverlay();
  // Initialize currentSection based on the current route
  const [, setCurrentSection] = useState(() => {
    const path = location.pathname.slice(1); // Remove leading '/'
    return ['about', 'projects', 'experience'].includes(path) ? path : 'about';
  });

  const handleClose = () => {
    closeOverlay();
    navigate("/");
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Update the URL to reflect the current section without causing a full navigation
    const newPath = `/${section}`;
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, '', newPath);
    }
  };


  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <div className="overlay-page">
      <div className="overlay-background" onClick={handleClose} />
      <div className="overlay-content">
        <OverlayNavigation onSectionChange={handleSectionChange} />
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        {/* Scrollable content */}
        <div className="page-content">
          {/* Atmospheric gradient background */}
          <div className="atmospheric-gradient-background"></div>
          {/* Background that scrolls with content */}
          <div className="overlay-starfield-background">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <Suspense fallback={null}>
                <Starfield 
                  staticMode={false}
                  starCount={800}
                  enableTwinkling={true}
                  enableMouseInteraction={false}
                  fov={10}
                  cameraPosition={{ x: 0, y: 0, z: 0 }}
                />
                <AsteroidBelt />
                {/* Red cube positioned at bottom center, same plane as asteroids */}
                <mesh position={[0, -10, -25]}>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="blue" />
                </mesh>

                <mesh position={[4, -10, -25]}>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="green" />
                </mesh>

                <mesh position={[-4, -10, -25]}>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="red" />
                </mesh>
                <DynamicAmbientLight minIntensity={0.1} maxIntensity={0.7} />
              </Suspense>
            </Canvas>
          </div>
          <div className="page-content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;