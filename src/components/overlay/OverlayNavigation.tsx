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

  return (
    <nav className="overlay-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`overlay-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default OverlayNavigation;