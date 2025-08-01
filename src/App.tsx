import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";
import PortfolioSections from "./content-ui/portfolio-sections/PortfolioSections";
import { OverlayProvider } from "./content-ui/context/NavigationOverlayContext";

function App() {
  return (
    <OverlayProvider>
      <Router>
        <div className="App">
          <SpaceBackground lookAt={[0, 1.4, 0]} />
          <Routes>
            <Route path="/about" element={<PortfolioSections />} />
            <Route path="/projects" element={<PortfolioSections />} />
            <Route path="/experience" element={<PortfolioSections />} />
          </Routes>
        </div>
      </Router>
    </OverlayProvider>
  );
}

export default App;
