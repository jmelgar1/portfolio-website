import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OverlayNavigation.css";

const OverlayNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/about", label: "ABOUT ME" },
    { path: "/projects", label: "PROJECTS" },
    { path: "/experience", label: "EXPERIENCE" }
  ];

  const handleNavClick = (path: string) => {
    if (location.pathname !== path) {
      // Since overlay is already open, navigate instantly
      navigate(path);
    }
  };

  return (
    <nav className="overlay-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`overlay-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleNavClick(item.path)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default OverlayNavigation;