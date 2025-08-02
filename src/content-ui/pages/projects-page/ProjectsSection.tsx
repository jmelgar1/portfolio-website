import { forwardRef } from 'react';
import './ProjectsSection.css';

const ProjectsSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} id="projects">
      <h1>
        Projects
      </h1>
      <div className="content">
        <p className="intro">
          Here are some of the projects I&apos;ve worked on, showcasing my skills in various technologies 
          and problem-solving approaches.
        </p>
        
        <div className="projects-container">
          <div className="project-item">
            <h3>Dark Matter Mapper</h3>
            <p className="description">
              AI-powered application using PyTorch and FastAPI to predict and visualize 3D dark matter distributions 
              based on SDSS/DES data with interactive Three.js volumetric rendering.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">Python</span>
              <span className="tech-tag">PyTorch</span>
              <span className="tech-tag">FastAPI</span>
              <span className="tech-tag">React</span>
              <span className="tech-tag">Three.js</span>
            </div>
            <a href="https://github.com/jmelgar1/dark-matter-mapper" target="_blank" rel="noopener noreferrer" className="project-link">
              View on GitHub
            </a>
          </div>

          <div className="project-item">
            <h3>Meal Planner</h3>
            <p className="description">
              Full-stack meal planning application using Python (FastAPI) and React, integrating Nutritionix and 
              Spoonacular APIs to provide real-time nutritional analysis and recipe recommendations.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">Python</span>
              <span className="tech-tag">FastAPI</span>
              <span className="tech-tag">React</span>
              <span className="tech-tag">JavaScript</span>
              <span className="tech-tag">Docker</span>
            </div>
            <a href="https://github.com/jmelgar1/meal-planner" target="_blank" rel="noopener noreferrer" className="project-link">
              View on GitHub
            </a>
          </div>

          <div className="project-item">
            <h3>Portfolio API</h3>
            <p className="description">
              Backend API service built with Go to support portfolio website functionality, 
              providing scalable and efficient server-side operations.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">Go</span>
              <span className="tech-tag">API</span>
            </div>
            <a href="https://github.com/jmelgar1/portfolio-api" target="_blank" rel="noopener noreferrer" className="project-link">
              View on GitHub
            </a>
          </div>

          <div className="project-item">
            <h3>Portfolio Website</h3>
            <p className="description">
              This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, 
              and modern React architecture built almost entirely with AI assistance.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">React</span>
              <span className="tech-tag">Three.js</span>
              <span className="tech-tag">TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;