import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";
import PortfolioSections from "./content-ui/portfolio-sections/PortfolioSections";
import { OverlayProvider, useOverlay } from "./content-ui/context/NavigationOverlayContext";

// Inner component that has access to overlay context
function AppContent() {
  const { overlayState } = useOverlay();
  
  // Conditionally render SpaceBackground based on overlay state
  // Render when:
  // 1. Overlay is closed (normal 3D background)
  // 2. Overlay is transitioning (opening or closing animations)
  // 3. NOT when overlay is showing (performance optimization)
  const shouldRenderBackground = !overlayState.isOverlayOpen || 
                                overlayState.isTransitioning || 
                                overlayState.transitionPhase !== 'showing';
  
  return (
    <Router>
      <div className="App">
        {shouldRenderBackground && <SpaceBackground />}
        <Routes>
          <Route path="/about" element={<PortfolioSections />} />
          <Route path="/projects" element={<PortfolioSections />} />
          <Route path="/experience" element={<PortfolioSections />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <OverlayProvider>
      <AppContent />
    </OverlayProvider>
  );
}

export default App;
