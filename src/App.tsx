import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";
import AboutPage from "./pages/AboutPage";
import ProjectsPage from "./pages/ProjectsPage";
import ExperiencePage from "./pages/ExperiencePage";
import { OverlayProvider } from "./context/OverlayContext";

function App() {
  return (
    <OverlayProvider>
      <Router>
        <div className="App">
          <SpaceBackground lookAt={[0, 1.4, 0]} />
          <Routes>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
          </Routes>
        </div>
      </Router>
    </OverlayProvider>
  );
}

export default App;
