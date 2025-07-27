import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OverlayNavigation from "./OverlayNavigation";
import "./OverlayPage.css";

interface OverlayPageProps {
  children: React.ReactNode;
}

const OverlayPage = ({ children }: OverlayPageProps) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
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
        <OverlayNavigation />
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