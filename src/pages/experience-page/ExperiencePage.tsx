import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";
import './ExperiencePage.css';

const ExperiencePage = () => {
  return (
    <OverlayPage>
      <div className="experience-page">
        <h1>
          Experience
        </h1>
        <div className="content">
          <p className="intro">
            My professional journey in software development and the technologies I&apos;ve mastered along the way.
          </p>
          
          <div className="experience-item">
            <h3>Software Developer</h3>
            <p className="description">Building modern web applications and user experiences</p>
            <ul>
              <li>Full-stack development with React and Node.js</li>
              <li>3D web graphics with Three.js and WebGL</li>
              <li>Database design and API development</li>
              <li>Performance optimization and testing</li>
            </ul>
          </div>

          <div className="skills-section">
            <h3>Technical Skills</h3>
            <div className="skills-grid">
              <div>
                <h4>Frontend</h4>
                <p>React, TypeScript, Three.js, CSS</p>
              </div>
              <div>
                <h4>Backend</h4>
                <p>Node.js, Python, APIs, Databases</p>
              </div>
              <div>
                <h4>Tools</h4>
                <p>Git, Docker, Testing, CI/CD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OverlayPage>
  );
};

export default ExperiencePage;