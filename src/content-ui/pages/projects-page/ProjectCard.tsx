import React from 'react';

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  comingSoon?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const { title, description, technologies, githubUrl, liveUrl, comingSoon, imageUrl, imageAlt } = project;

  return (
    <div 
      className="project-card"
      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
    >
      <div className="project-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={imageAlt || `${title} project screenshot`}
            className="project-image"
          />
        ) : (
          <div className="project-image-placeholder">
            <span className="placeholder-text">Project Image</span>
          </div>
        )}
        
        <div className="project-title-overlay">
          <h3>{title}</h3>
        </div>
        
        <div className="project-hover-overlay">
          <div className="project-overlay-content">
            <h3 className="overlay-title">{title}</h3>
            <p className="overlay-description">
              {description}
              {comingSoon && <span className="coming-soon"> (Coming Soon)</span>}
            </p>
            <div className="overlay-tech-tags">
              {technologies.map((tech, techIndex) => (
                <span key={techIndex} className="overlay-tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="overlay-project-links">
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="overlay-project-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on GitHub
                </a>
              )}
              {liveUrl && (
                <a 
                  href={liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="overlay-project-link overlay-project-link-live"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;