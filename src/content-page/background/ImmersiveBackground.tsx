import React, { useState, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import OverlayNavigation from "../navigation-bar/ContentNavigationBar";
import { useOverlay } from "../context/NavigationOverlayContext";
import Starfield from '../../home-page/stars/star-field/Starfield';
import AsteroidBelt from './asteroid-belt/AsteroidBelt';
import DynamicAmbientLight from './lighting/DynamicAmbientLight';
import MountainTerrain from './planet-terrain/MountainTerrain';
import "./ImmersiveBackground.css";

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
  
  // Generate a new random seed each time the overlay loads
  const [terrainSeed] = useState(() => Math.random() * 1000);

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
                <DynamicAmbientLight minIntensity={0.1} maxIntensity={0.7} />
                
                {/* Starfield */}
                <group name="starfield-group">
                  <Starfield 
                    staticMode={false}
                    starCount={800}
                    enableTwinkling={true}
                    enableMouseInteraction={false}
                    fov={6}
                    cameraPosition={{ x: 0, y: 0, z: 0 }}
                  />
                </group>
                
                {/* Asteroid Belt */}
                <group name="asteroid-belt-group">
                  <AsteroidBelt />
                </group>
                
                {/* Mountain Terrain */}
                <group name="mountain-terrain-group">
                  <MountainTerrain 
                    position={[0, -310, -1000]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    width={520}
                    length={700}
                    maxHeight={300}
                    segments={92}
                    seed={terrainSeed}
                  />
                </group>
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