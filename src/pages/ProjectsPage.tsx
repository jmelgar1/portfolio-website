import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";

const ProjectsPage = () => {
  return (
    <OverlayPage>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
          Projects
        </h1>
        <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '2rem' }}>
            Here are some of the projects I&apos;ve worked on, showcasing my skills in various technologies 
            and problem-solving approaches.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Portfolio Website</h3>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, 
              and modern React architecture.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>React</span>
              <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>Three.js</span>
              <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>TypeScript</span>
            </div>
          </div>

          <p style={{ opacity: 0.7, fontStyle: 'italic' }}>
            More projects coming soon...
          </p>
        </div>
      </div>
    </OverlayPage>
  );
};

export default ProjectsPage;