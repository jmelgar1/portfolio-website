import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";

const ExperiencePage = () => {
  return (
    <OverlayPage>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
          Experience
        </h1>
        <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '2rem' }}>
            My professional journey in software development and the technologies I&apos;ve mastered along the way.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Software Developer</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Building modern web applications and user experiences</p>
            <ul style={{ marginLeft: '1.5rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '0.5rem' }}>Full-stack development with React and Node.js</li>
              <li style={{ marginBottom: '0.5rem' }}>3D web graphics with Three.js and WebGL</li>
              <li style={{ marginBottom: '0.5rem' }}>Database design and API development</li>
              <li style={{ marginBottom: '0.5rem' }}>Performance optimization and testing</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Technical Skills</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Frontend</h4>
                <p style={{ opacity: 0.7, fontSize: '1rem' }}>React, TypeScript, Three.js, CSS</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Backend</h4>
                <p style={{ opacity: 0.7, fontSize: '1rem' }}>Node.js, Python, APIs, Databases</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Tools</h4>
                <p style={{ opacity: 0.7, fontSize: '1rem' }}>Git, Docker, Testing, CI/CD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OverlayPage>
  );
};

export default ExperiencePage;