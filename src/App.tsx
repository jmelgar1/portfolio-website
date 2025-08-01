import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";
import UnifiedOverlayPage from "./pages/unified-overlay-page/UnifiedOverlayPage";
import { OverlayProvider } from "./context/OverlayContext";

function App() {
  return (
    <OverlayProvider>
      <Router>
        <div className="App">
          <SpaceBackground lookAt={[0, 1.4, 0]} />
          <Routes>
            <Route path="/about" element={<UnifiedOverlayPage />} />
            <Route path="/projects" element={<UnifiedOverlayPage />} />
            <Route path="/experience" element={<UnifiedOverlayPage />} />
          </Routes>
        </div>
      </Router>
    </OverlayProvider>
  );
}

export default App;
