import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";
import PortfolioSections from "./content-ui/portfolio-sections/PortfolioSections";
import { OverlayProvider, useOverlay } from "./content-ui/context/NavigationOverlayContext";

// Inner component that has access to overlay context
function AppContent() {
  const { overlayState } = useOverlay();
  
  // Conditionally render SpaceBackground based on overlay state
  // ONLY render when:
  // 1. Overlay is closed (transitionPhase === 'idle') 
  // 2. Overlay is transitioning (expanding/fading phases)
  // NEVER render when overlay is showing (GPU optimization)
  const shouldRenderBackground = overlayState.transitionPhase !== 'showing';

  // Debug logging for GPU optimization tracking
  console.log('🖥️ SpaceBackground render decision:', {
    shouldRender: shouldRenderBackground,
    transitionPhase: overlayState.transitionPhase,
    isTransitioning: overlayState.isTransitioning,
    isOverlayOpen: overlayState.isOverlayOpen
  });
  
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
