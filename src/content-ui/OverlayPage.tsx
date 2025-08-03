import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OverlayNavigation from "./OverlayNavigation";
import { useOverlay } from "./context/NavigationOverlayContext";
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
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;