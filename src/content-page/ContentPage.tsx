import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "./background/ImmersiveBackground";
import AboutSection from "./modules/about-module/AboutSection";
import ProjectsSection from "./modules/projects-module/ProjectsSection";
import ExperienceSection from "./modules/experience-module/ExperienceSection";
import ContentNavigationBar, { ContentNavigationBarRef } from "./navigation-bar/ContentNavigationBar";
import './ContentPage.css';

const ContentPage = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<ContentNavigationBarRef>(null);
  
  const [, setActiveSection] = useState("about");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Update active section state based on URL 
    let sectionId = 'about';
    
    if (location.pathname === '/projects') {
      sectionId = 'projects';
    } else if (location.pathname === '/experience') {
      sectionId = 'experience';
    } else if (location.pathname === '/about') {
      sectionId = 'about';
    }

    setActiveSection(sectionId);
    
    // Only scroll to section on initial load (coming from home page)
    // After that, let users control their scroll position
    if (isInitialLoad && navigationRef.current) {
      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.scrollToSection(sectionId);
        }
      }, 100);
      setIsInitialLoad(false);
    }
  }, [location.pathname, isInitialLoad]);

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

export default ContentPage;