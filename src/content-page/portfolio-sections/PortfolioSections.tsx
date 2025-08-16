import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "../background/ImmersiveBackground";
import AboutSection from "../modules/about-module/AboutSection";
import ProjectsSection from "../modules/projects-module/ProjectsSection";
import ExperienceSection from "../modules/experience-module/ExperienceSection";
import ContentNavigationBar from "../navigation-bar/ContentNavigationBar";
import './PortfolioSections.css';

const PortfolioSections = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  
  const [, setActiveSection] = useState("about");

  useEffect(() => {
    // Scroll to the appropriate section based on the route
    const scrollToSection = () => {
      let targetRef = aboutRef;
      let sectionId = 'about';
      
      if (location.pathname === '/projects') {
        targetRef = projectsRef;
        sectionId = 'projects';
      } else if (location.pathname === '/experience') {
        targetRef = experienceRef;
        sectionId = 'experience';
      }

      setActiveSection(sectionId);

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

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <OverlayPage>
      <ContentNavigationBar onSectionChange={handleSectionChange} />
      <div className="portfolio-sections">
        <AboutSection ref={aboutRef} />
        <ProjectsSection ref={projectsRef} />
        <ExperienceSection ref={experienceRef} />
      </div>
    </OverlayPage>
  );
};

export default PortfolioSections;