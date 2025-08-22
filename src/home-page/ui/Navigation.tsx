import { useNavigate } from "react-router-dom";
import { useOverlay } from "../../content-page/context/NavigationOverlayContext";
import "./Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();
  const { openOverlay } = useOverlay();

  const handleNavClick = (path: string) => {
    openOverlay();
    navigate(path);
  };

  return (
    <nav className="simple-nav">
      <button 
        className="nav-item"
        onClick={() => handleNavClick('/about')}
      >
        ABOUT ME
      </button>
      <button 
        className="nav-item"
        onClick={() => handleNavClick('/projects')}
      >
        PROJECTS
      </button>
      <button 
        className="nav-item"
        onClick={() => handleNavClick('/experience')}
      >
        EXPERIENCE
      </button>
    </nav>
  );
};

export default Navigation;