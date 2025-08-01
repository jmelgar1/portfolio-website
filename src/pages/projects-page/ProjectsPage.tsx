import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";
import './ProjectsPage.css';

const ProjectsPage = () => {
  return (
    <OverlayPage>
      <div className="projects-page">
        <h1>
          Projects
        </h1>
        <div className="content">
          <p className="intro">
            Here are some of the projects I&apos;ve worked on, showcasing my skills in various technologies 
            and problem-solving approaches.
          </p>
          
          <div className="project-item">
            <h3>Portfolio Website</h3>
            <p className="description">
              This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, 
              and modern React architecture.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">React</span>
              <span className="tech-tag">Three.js</span>
              <span className="tech-tag">TypeScript</span>
            </div>
          </div>

          <p className="coming-soon">
            More projects coming soon...
          </p>
        </div>
      </div>
    </OverlayPage>
  );
};

export default ProjectsPage;