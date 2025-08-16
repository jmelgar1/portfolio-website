import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "../background/ImmersiveBackground";
import AboutSection from "../modules/about-module/AboutSection";
import ProjectsSection from "../modules/projects-module/ProjectsSection";
import ExperienceSection from "../modules/experience-module/ExperienceSection";
import ContentNavigationBar, { ContentNavigationBarRef } from "../navigation-bar/ContentNavigationBar";
import './PortfolioSections.css';

const PortfolioSections = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<ContentNavigationBarRef>(null);
  
  const [, setActiveSection] = useState("about");

  useEffect(() => {
    // Scroll to the appropriate section based on the route
    const scrollToSection = () => {
      let sectionId = 'about';
      
      if (location.pathname === '/projects') {
        sectionId = 'projects';
      } else if (location.pathname === '/experience') {
        sectionId = 'experience';
      }

      setActiveSection(sectionId);

      // Use the navigation component's scroll method
      if (navigationRef.current) {
        navigationRef.current.scrollToSection(sectionId);
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
      <ContentNavigationBar ref={navigationRef} onSectionChange={handleSectionChange} />
      <div className="portfolio-sections">
        <AboutSection ref={aboutRef} />
        <ProjectsSection ref={projectsRef} />
        <ExperienceSection ref={experienceRef} />
      </div>
    </OverlayPage>
  );
};

export default PortfolioSections;