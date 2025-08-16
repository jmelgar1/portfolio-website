import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "../background/OverlayPage";
import AboutSection from "../modules/about-module/AboutSection";
import ProjectsSection from "../modules/projects-module/ProjectsSection";
import ExperienceSection from "../modules/experience-module/ExperienceSection";
import './PortfolioSections.css';

const PortfolioSections = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Scroll to the appropriate section based on the route
    const scrollToSection = () => {
      let targetRef = aboutRef;
      
      if (location.pathname === '/projects') {
        targetRef = projectsRef;
      } else if (location.pathname === '/experience') {
        targetRef = experienceRef;
      }

      if (targetRef.current) {
        const scrollContainer = document.querySelector('.page-content') as HTMLElement;
        if (scrollContainer) {
          // Get the element's position relative to the scroll container
          const elementTop = targetRef.current.offsetTop;
          
          // Small offset to position header nicely below nav
          const offset = 20;
          
          scrollContainer.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth'
          });
        }
      }
    };

    // Small delay to ensure the overlay is fully rendered
    const timer = setTimeout(scrollToSection, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <OverlayPage>
      <div className="portfolio-sections">
        <AboutSection ref={aboutRef} />
        <ProjectsSection ref={projectsRef} />
        <ExperienceSection ref={experienceRef} />
      </div>
    </OverlayPage>
  );
};

export default PortfolioSections;