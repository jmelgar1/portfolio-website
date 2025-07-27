import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";

const AboutPage = () => {
  return (
    <OverlayPage>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
          About Me
        </h1>
        <div style={{ fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '800px' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Welcome! I&apos;m a passionate software developer with expertise in modern web technologies 
            and a love for creating innovative digital experiences.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            My journey in technology spans across full-stack development, with particular strengths 
            in React, TypeScript, and Three.js for creating immersive web experiences.
          </p>
          <p>
            When I&apos;m not coding, you can find me exploring new technologies, contributing to open-source 
            projects, and continuously learning about the ever-evolving world of software development.
          </p>
        </div>
      </div>
    </OverlayPage>
  );
};

export default AboutPage;