import React from "react";
import OverlayPage from "../components/overlay/OverlayPage";
import './AboutPage.css';

const AboutPage = () => {
  return (
    <OverlayPage>
      <div className="about-page">
        <h1>
          About Me
        </h1>
        <div className="content">
          <p>
            Welcome! I&apos;m a passionate software developer with expertise in modern web technologies 
            and a love for creating innovative digital experiences.
          </p>
          <p>
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