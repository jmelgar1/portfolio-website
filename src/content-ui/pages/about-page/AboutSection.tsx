import { forwardRef } from 'react';
import './AboutSection.css';

const AboutSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} id="about">
      <h1>
        About Me
      </h1>
      <div className="content about-content">
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
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;