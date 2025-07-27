import React from "react";
import "./Navigation.css";

interface NavigationProps {
  getCurrentSection: () => number;
  scrollToSection: (section: number) => void;
}

const Navigation = ({ getCurrentSection, scrollToSection }: NavigationProps) => {
  return (
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
  );
};

export default Navigation;