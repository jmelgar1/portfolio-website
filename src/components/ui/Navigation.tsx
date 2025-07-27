import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="simple-nav">
      <button 
        className="nav-item"
        onClick={() => navigate('/about')}
      >
        ABOUT ME
      </button>
      <button 
        className="nav-item"
        onClick={() => navigate('/projects')}
      >
        PROJECTS
      </button>
      <button 
        className="nav-item"
        onClick={() => navigate('/experience')}
      >
        EXPERIENCE
      </button>
    </nav>
  );
};

export default Navigation;