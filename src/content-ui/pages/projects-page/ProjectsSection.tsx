import { forwardRef } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from './projectsData';
import './ProjectsSection.css';

const ProjectsSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} id="projects">
      <h1>
        Projects
      </h1>
      <div className="content">
        <p className="intro">
          Here are some of the projects I've worked on in my spare time:
        </p>
        
        <div className="projects-container">
          {projectsData.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;